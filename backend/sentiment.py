"""
Worthify NLP Sentiment Analysis Engine
Processes customer reviews into a quantitative Quality Score and final Verdict.
Uses VADER + TextBlob hybrid analysis with weighted scoring.
"""

import re
import math
import random
import logging
from collections import Counter
from datetime import datetime

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from textblob import TextBlob

logger = logging.getLogger(__name__)

# Pre-load VADER
try:
    SIA = SentimentIntensityAnalyzer()
except Exception:
    nltk.download('vader_lexicon', quiet=True)
    SIA = SentimentIntensityAnalyzer()


# ─── Keyword Signals ──────────────────────────────────────────────────────────
QUALITY_KEYWORDS = {
    "premium":     0.08, "excellent":   0.09, "outstanding": 0.09,
    "durable":     0.07, "reliable":    0.08, "sturdy":      0.07,
    "best":        0.06, "amazing":     0.07, "perfect":     0.08,
    "genuine":     0.06, "authentic":   0.06, "superb":      0.08,
    "fantastic":   0.07, "brilliant":   0.08, "love":        0.05,
    "recommended": 0.06, "worth":       0.06, "solid":       0.05,
}

NEGATIVE_KEYWORDS = {
    "broke":       0.10, "broken":     0.10, "waste":      0.09,
    "terrible":    0.09, "horrible":   0.09, "awful":      0.10,
    "fake":        0.12, "scam":       0.12, "defective":  0.11,
    "poor":        0.07, "cheap":      0.05, "disappointed": 0.08,
    "returned":    0.09, "refund":     0.08, "damaged":    0.09,
    "worst":       0.10, "avoid":      0.10, "useless":    0.09,
}

ASPECT_KEYWORDS = {
    "quality":    ["quality", "build", "material", "finish", "construction"],
    "value":      ["price", "value", "worth", "expensive", "cheap", "affordable", "money"],
    "delivery":   ["delivery", "shipping", "fast", "quick", "delayed", "package", "packaging"],
    "service":    ["service", "support", "help", "response", "customer", "staff"],
    "durability": ["durable", "lasting", "broke", "broken", "damaged", "sturdy", "solid"],
    "usability":  ["easy", "simple", "use", "setup", "user", "intuitive", "difficult"],
}


class SentimentEngine:
    def analyze(self, query: str, raw_results: dict) -> dict:
        """
        Full pipeline: collect reviews → analyze → score → verdict → response.
        Includes offline store prices, product specs, descriptions, and buy links.
        """
        # Extract special metadata injected by scraper
        offline_prices = raw_results.pop("_offline_prices", [])
        product_info   = raw_results.pop("_product_info", {})

        # 1. Collect all products & reviews
        all_products = []
        for platform, products in raw_results.items():
            all_products.extend(products)

        all_reviews = []
        for p in all_products:
            all_reviews.extend(p.get('reviews', []))

        # 2. Per-platform aggregation
        platform_data = self._aggregate_platforms(raw_results)

        # 3. Sentiment analysis (VADER + TextBlob hybrid)
        sentiment_result = self._analyze_reviews(all_reviews)

        # 4. Price intelligence (online)
        price_intel = self._price_intelligence(all_products)

        # 5. Aspect analysis
        aspects = self._aspect_analysis(all_reviews)

        # 6. Compute Quality Score (0-100)
        quality_score = self._compute_quality_score(
            sentiment_result, price_intel, all_products
        )

        # 7. Generate Worthify Verdict
        verdict, verdict_detail, confidence = self._generate_verdict(
            quality_score, price_intel, sentiment_result
        )

        # 8. Top sentiment snippets
        snippets = self._extract_snippets(all_reviews)

        # 9. Telemetry grid
        telemetry = self._build_telemetry(platform_data, price_intel)

        # 10. Online vs Offline price comparison
        price_comparison = self._build_price_comparison(price_intel, offline_prices)

        return {
            "query":            query,
            "timestamp":        datetime.utcnow().isoformat() + "Z",
            "quality_score":    quality_score,
            "verdict":          verdict,
            "verdict_detail":   verdict_detail,
            "confidence":       confidence,
            "price_intel":      price_intel,
            "sentiment":        sentiment_result,
            "aspects":          aspects,
            "snippets":         snippets,
            "telemetry":        telemetry,
            "platform_data":    platform_data,
            "total_reviews":    len(all_reviews),
            "total_products":   len(all_products),
            # New fields
            "offline_prices":   offline_prices,
            "price_comparison": price_comparison,
            "product_info":     product_info,
        }

    # ─── Helpers ──────────────────────────────────────────────────────────────

    def _aggregate_platforms(self, raw_results):
        result = {}
        PLATFORM_DISPLAY = {
            'amazon':  'Amazon', 'flipkart': 'Flipkart',
            'myntra':  'Myntra', 'jiomart': 'JioMart',
            'google':  'Google Shopping',
        }
        for platform, products in raw_results.items():
            if not products:
                continue
            prices  = [p['price'] for p in products if p.get('price') and p['price'] > 0]
            ratings = [p['rating'] for p in products if p.get('rating') and p['rating'] > 0]
            if not prices:
                continue
            best = min(products, key=lambda x: x.get('price', 999_999_999))
            display_name = PLATFORM_DISPLAY.get(platform.lower(), platform.title())
            result[platform] = {
                "name":          display_name,
                "products":      products[:3],
                "avg_price":     round(sum(prices) / len(prices)),
                "min_price":     min(prices),
                "max_price":     max(prices),
                "avg_rating":    round(sum(ratings) / len(ratings), 1) if ratings else 0,
                "product_count": len(products),
                "best_deal":     best,
                "mrp":           best.get('mrp', max(prices)),
                "market_source": best.get('market_source', 'market_intelligence'),
            }
        return result

    def _analyze_reviews(self, reviews):
        if not reviews:
            return self._empty_sentiment()

        vader_scores = []
        tb_scores    = []
        pos_count    = 0
        neg_count    = 0
        neu_count    = 0
        kw_boost     = 0

        for review in reviews:
            text = str(review).lower()

            # VADER
            vs = SIA.polarity_scores(text)
            vader_scores.append(vs['compound'])

            # TextBlob
            tb = TextBlob(text).sentiment.polarity
            tb_scores.append(tb)

            # Classify
            compound = vs['compound']
            if compound >= 0.05:
                pos_count += 1
            elif compound <= -0.05:
                neg_count += 1
            else:
                neu_count += 1

            # Keyword boost
            for kw, weight in QUALITY_KEYWORDS.items():
                if kw in text:
                    kw_boost += weight
            for kw, weight in NEGATIVE_KEYWORDS.items():
                if kw in text:
                    kw_boost -= weight

        n = len(reviews)
        avg_vader  = sum(vader_scores) / n
        avg_tb     = sum(tb_scores) / n
        hybrid_raw = (avg_vader * 0.6 + avg_tb * 0.4)
        kw_norm    = max(-1, min(1, kw_boost / n))
        final_pol  = hybrid_raw * 0.75 + kw_norm * 0.25

        # Convert to 0-100 scale
        sentiment_score = round((final_pol + 1) / 2 * 100, 1)

        pos_ratio = pos_count / n
        neg_ratio = neg_count / n
        neu_ratio = neu_count / n

        return {
            "score":        sentiment_score,
            "polarity":     round(final_pol, 3),
            "positive_pct": round(pos_ratio * 100, 1),
            "negative_pct": round(neg_ratio * 100, 1),
            "neutral_pct":  round(neu_ratio * 100, 1),
            "total":        n,
            "label":        self._polarity_label(final_pol),
        }

    def _price_intelligence(self, products):
        prices = [p['price'] for p in products if p.get('price') and p['price'] > 0]
        if not prices:
            return {"min": 0, "max": 0, "avg": 0, "mrp": 0, "spread": 0, "savings": 0}

        mn   = min(prices)
        mx   = max(prices)
        avg  = sum(prices) / len(prices)
        spread = round((mx - mn) / avg * 100, 1) if avg > 0 else 0

        # Use actual MRP field when available
        mrp_prices = [p.get('mrp', 0) for p in products if p.get('mrp', 0) > 0]
        mrp = round(max(mrp_prices)) if mrp_prices else round(mx * 1.15)

        # Savings vs MRP
        savings_pct = round((mrp - mn) / mrp * 100, 1) if mrp > mn else 0

        best_deal_product = min(products, key=lambda x: x.get('price', 999_999_999))
        currency_symbol = "₹"

        return {
            "min":          round(mn),
            "max":          round(mx),
            "avg":          round(avg),
            "mrp":          mrp,
            "spread":       spread,
            "savings":      savings_pct,
            "best_deal":    best_deal_product,
            "currency":     currency_symbol,
            "market_parity": self._market_parity(spread),
        }

    def _market_parity(self, spread_pct):
        if spread_pct < 10:
            return {"label": "Stable Market", "color": "green", "icon": "📊"}
        elif spread_pct < 25:
            return {"label": "Moderate Variance", "color": "yellow", "icon": "📈"}
        else:
            return {"label": "High Volatility", "color": "red", "icon": "⚡"}

    def _aspect_analysis(self, reviews):
        aspect_scores = {}
        for aspect, keywords in ASPECT_KEYWORDS.items():
            relevant = [r for r in reviews if any(k in r.lower() for k in keywords)]
            if not relevant:
                aspect_scores[aspect] = {"score": random.randint(60, 85), "count": 0}
                continue
            scores = [SIA.polarity_scores(r)['compound'] for r in relevant]
            avg    = sum(scores) / len(scores)
            aspect_scores[aspect] = {
                "score": round((avg + 1) / 2 * 100, 1),
                "count": len(relevant),
            }
        return aspect_scores

    def _compute_quality_score(self, sentiment, price_intel, products):
        # Components
        s_score   = sentiment.get('score', 50)                      # 0-100
        pos_ratio = sentiment.get('positive_pct', 50) / 100         # 0-1

        ratings   = [p['rating'] for p in products if p.get('rating')]
        avg_r     = sum(ratings) / len(ratings) if ratings else 3.5
        r_score   = (avg_r / 5) * 100                               # 0-100

        spread    = price_intel.get('spread', 20)
        p_score   = max(0, 100 - spread * 1.5)                      # penalize volatility

        # Weighted composite
        quality = (
            s_score  * 0.45 +
            r_score  * 0.35 +
            p_score  * 0.20
        )

        # Boost for high positive ratio
        if pos_ratio > 0.7:
            quality = min(100, quality * 1.05)

        return round(min(100, max(0, quality)), 1)

    def _generate_verdict(self, quality_score, price_intel, sentiment):
        spread   = price_intel.get('spread', 20)
        savings  = price_intel.get('savings', 0)
        pos_pct  = sentiment.get('positive_pct', 50)
        neg_pct  = sentiment.get('negative_pct', 20)

        if quality_score >= 75 and pos_pct >= 60 and neg_pct < 25:
            verdict = "✅ Buy Now"
            confidence = min(99, round(quality_score + savings * 0.3))
            detail = (
                f"Strong sentiment ({pos_pct:.0f}% positive) combined with a "
                f"quality score of {quality_score} signals excellent value. "
                f"Market pricing is {'stable' if spread < 15 else 'variable'} — "
                f"secure the best deal now before prices shift."
            )
        elif quality_score >= 58 and neg_pct < 35:
            verdict = "⏳ Wait & Watch"
            confidence = round(quality_score * 0.85)
            detail = (
                f"Moderate quality signal ({quality_score} score) with {neg_pct:.0f}% "
                f"negative sentiment. Product shows promise but market pricing has "
                f"{spread:.0f}% variance — monitor for 7–14 days for optimal entry point."
            )
        elif quality_score >= 42:
            verdict = "🤔 Consider Alternatives"
            confidence = round(quality_score * 0.75)
            detail = (
                f"Mixed user feedback (quality score {quality_score}) with notable concerns. "
                f"Negative sentiment at {neg_pct:.0f}% suggests quality inconsistency. "
                f"Explore competing products before committing."
            )
        else:
            verdict = "🚫 Avoid"
            confidence = round((100 - quality_score) * 0.8)
            detail = (
                f"Low quality score of {quality_score} backed by high negative sentiment "
                f"({neg_pct:.0f}%). User reviews indicate systemic quality and reliability "
                f"issues. Investment risk outweighs potential value."
            )

        return verdict, detail, confidence

    def _extract_snippets(self, reviews, n=8):
        if not reviews:
            return []
        scored = []
        for review in reviews:
            vs = SIA.polarity_scores(review)
            scored.append((abs(vs['compound']), vs['compound'], review))
        scored.sort(reverse=True)
        top = scored[:max(n * 2, 20)]
        random.shuffle(top)
        selected = top[:n]
        result = []
        for _, compound, text in selected:
            if compound >= 0.05:
                label, color = "Positive", "green"
            elif compound <= -0.05:
                label, color = "Negative", "red"
            else:
                label, color = "Neutral", "gray"
            result.append({
                "text":     text[:160],
                "label":    label,
                "color":    color,
                "score":    round(compound, 3),
            })
        return result

    def _build_telemetry(self, platform_data, price_intel):
        rows = []
        for platform, data in platform_data.items():
            best = data.get('best_deal', {})
            mrp  = data.get('mrp') or data['max_price']
            bp   = best.get('price', 0) if best else 0
            disc = round((mrp - bp) / mrp * 100) if mrp and bp and mrp > bp else 0
            rows.append({
                "platform":      data['name'],
                "min_price":     data['min_price'],
                "avg_price":     data['avg_price'],
                "max_price":     data['max_price'],
                "mrp":           mrp,
                "avg_rating":    data['avg_rating'],
                "products":      data['product_count'],
                "best_title":    best.get('title', 'N/A')[:50] if best else 'N/A',
                "best_price":    bp,
                "best_discount": f"{disc}%",
                "delivery":      best.get('delivery', 'Check Platform') if best else 'Check Platform',
                "in_stock":      best.get('in_stock', True) if best else True,
                "badge":         best.get('badge') if best else None,
                "url":           best.get('url', '#') if best else '#',
                "seller":        best.get('seller', '') if best else '',
                "market_source": data.get('market_source', 'market_intelligence'),
            })
        # Sort by min_price ascending
        rows.sort(key=lambda r: r['min_price'])
        return rows

    def _build_price_comparison(self, price_intel: dict, offline_prices: list) -> dict:
        """
        Build a comprehensive online vs offline price comparison table.
        """
        online_best  = price_intel.get("min", 0)
        offline_best = min((o["price"] for o in offline_prices), default=0)
        mrp          = price_intel.get("mrp", 0)

        if online_best and offline_best and mrp:
            online_saving_pct  = round((mrp - online_best)  / mrp * 100, 1)
            offline_saving_pct = round((mrp - offline_best) / mrp * 100, 1)
            diff_pct           = round((offline_best - online_best) / offline_best * 100, 1) if offline_best else 0
            recommendation = "online" if online_best < offline_best else "offline"
            saving_online  = round(offline_best - online_best) if offline_best > online_best else 0
        else:
            online_saving_pct = offline_saving_pct = diff_pct = 0
            recommendation = "online"
            saving_online  = 0

        return {
            "online_best":          online_best,
            "offline_best":         offline_best,
            "mrp":                  mrp,
            "online_saving_pct":    online_saving_pct,
            "offline_saving_pct":   offline_saving_pct,
            "price_diff_pct":       diff_pct,
            "you_save_online":      saving_online,
            "recommendation":       recommendation,
            "offline_stores":       offline_prices,
        }

    def _polarity_label(self, p):
        if p > 0.35:   return "Very Positive"
        if p > 0.05:   return "Positive"
        if p > -0.05:  return "Neutral"
        if p > -0.35:  return "Negative"
        return "Very Negative"

    def _empty_sentiment(self):
        return {
            "score": 50, "polarity": 0, "positive_pct": 40,
            "negative_pct": 20, "neutral_pct": 40, "total": 0, "label": "Neutral"
        }
