# Worthify — AI-Powered Purchase Intelligence

> Sentiment-aware e-commerce decision support system

## Overview
Worthify is a full-stack web application that scrapes Amazon, Flipkart, Myntra, and Google Shopping simultaneously, then applies NLP sentiment analysis to customer reviews to deliver a data-driven "Worthify Verdict" on whether a product is worth buying.

## Features Implemented

### Backend (Flask)
- ✅ JWT-based authentication (signup/login/me) with bcrypt password hashing
- ✅ Multi-platform scraper: Amazon IN, Flipkart, Myntra, Google Shopping
- ✅ Rotating user-agent pool + CloudScraper bypass for unblockable scraping
- ✅ Intelligent fallback to enriched mock data when scrapers are blocked
- ✅ VADER + TextBlob hybrid NLP sentiment engine
- ✅ Aspect-level analysis: Quality, Value, Delivery, Service, Durability, Usability
- ✅ Quality Score formula: Sentiment(45%) + Ratings(35%) + PriceStability(20%)
- ✅ Worthify Verdict: Buy Now / Wait & Watch / Consider Alternatives / Avoid
- ✅ Price intelligence: min/max/avg/spread/savings + market parity signals
- ✅ Per-user search history (20 entries) + analytics endpoints

### Frontend (Tailwind CSS + Vanilla JS)
- ✅ Professional slate-gray + soft-blue UI
- ✅ Minimalist landing page with hero, features, how-it-works, CTA
- ✅ Secure JWT login & signup forms with validation
- ✅ Advanced intelligence dashboard with sidebar navigation
- ✅ Live telemetry grid (4 platforms, price comparison)
- ✅ Interactive Chart.js charts (price bar chart, sentiment doughnut)
- ✅ Product overview cards with ratings, discounts, delivery info
- ✅ Sentiment snippet gallery with polarity coloring
- ✅ Aspect analysis with animated progress bars
- ✅ Quality score ring animation
- ✅ Real-time clock + live status badge
- ✅ Search history with re-run capability
- ✅ Analytics page with verdict distribution chart
- ✅ Toast notification system
- ✅ Quick search suggestions

## Tech Stack
- **Backend**: Python 3, Flask, Flask-JWT-Extended, NLTK (VADER), TextBlob, CloudScraper, BeautifulSoup4
- **Frontend**: Tailwind CSS (CDN), Chart.js, Font Awesome, Google Fonts (Inter)
- **Runtime**: PM2 process manager
- **Auth**: JWT RS256, bcrypt password hashing

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login & get token |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/analyze | Yes | Analyze product |
| GET | /api/history | Yes | Search history |
| GET | /api/stats | Yes | Verdict statistics |

## Quality Score Formula
```
Quality Score = Sentiment(45%) + AvgRating(35%) + PriceStability(20%)
```

## Verdict Thresholds
- ✅ **Buy Now**: Score ≥ 75, Positive% ≥ 60, Negative% < 25
- ⏳ **Wait & Watch**: Score ≥ 58
- 🤔 **Consider Alternatives**: Score ≥ 42
- 🚫 **Avoid**: Score < 42

## Running Locally
```bash
pip install -r requirements.txt
python3 -c "import nltk; nltk.download('vader_lexicon')"
pm2 start ecosystem.config.cjs
# Visit http://localhost:3000
```
