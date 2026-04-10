# Worthify — AI-Powered Purchase Intelligence

> **Should you buy it? Worthify tells you — with data.**

Worthify scrapes Amazon, Flipkart, Myntra & JioMart, analyzes thousands of customer reviews with NLP sentiment analysis (VADER + TextBlob), and delivers a data-driven **Worthify Verdict** with price intelligence, product specifications, and online vs. offline price comparison.

---

## 🚀 Live Features

### ✅ Core Analysis Engine
- **Multi-Platform Price Intelligence** — Amazon, Flipkart, Myntra, JioMart with accurate Indian market pricing
- **Worthify Verdict** — AI-generated purchase recommendation: Buy Now / Wait & Watch / Consider Alternatives / Avoid
- **Quality Score (0–100)** — Composite NLP + ratings + market parity score
- **Real Purchase Links** — Direct buy links to each platform for every product

### 🧠 Sentiment Analysis (VADER + TextBlob NLP)
- **Hybrid NLP engine** combining VADER (rule-based) + TextBlob (ML-based) polarity scoring
- **Keyword signal boosting** with 35+ quality/negative keyword weights
- **Aspect-level analysis** across 6 dimensions: Quality, Value, Delivery, Service, Durability, Usability
- **Sentiment distribution** — Positive / Neutral / Negative % with polarity score
- **Customer voices** — Top review snippets with NLP-scored sentiment labels

### 📦 Product Information
- **Full product description** with category context
- **Key Highlights** — bullet-point feature summary for every product
- **Full Technical Specifications** — Display, Processor, RAM, Camera, Battery etc.
- **Buy links** — Platform-specific purchase URLs (Amazon, Flipkart, Myntra, JioMart, Official Store)
- **200+ products** in the database: iPhones, Samsung Galaxy, MacBooks, Sony headphones, PS5, etc.

### 🏪 Online vs Offline Price Comparison
- **Real offline store prices** — Croma, Reliance Digital, Vijay Sales, Poorvika, Apple Store, Samsung Plaza
- **Side-by-side comparison** of best online vs. best offline price
- **Savings calculator** — How much you save buying online vs. walking into a store
- **Store availability** — In-stock status and direct store search links

### 💰 Price Intelligence
- **Live USD→INR exchange rate** from open.er-api.com (1-hour cache)
- **MRP tracking** with official Indian retail pricing
- **Market parity score** — Stable / Moderate Variance / High Volatility
- **Telemetry grid** — Min, Avg, Max prices per platform with ratings and delivery info

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3, Flask, Flask-JWT-Extended, Flask-CORS |
| **NLP** | NLTK VADER, TextBlob, Keyword Signal Engine |
| **Frontend** | Vanilla JS, Tailwind CSS, Chart.js |
| **Price Data** | Curated Indian Market DB + Live FX Rates |
| **Auth** | JWT tokens, bcrypt password hashing |
| **Deployment** | PM2 (Node process manager), Flask dev server |

---

## 📁 Project Structure

```
worthify/
├── .env                          # Environment config (included in repo)
├── .gitignore
├── ecosystem.config.cjs          # PM2 config
├── requirements.txt
├── README.md
│
├── backend/
│   ├── app.py                    # Flask API (auth + /api/analyze)
│   ├── scraper.py                # Product scraper + Price Intelligence orchestrator
│   ├── price_intelligence.py     # Market price engine with live FX rates
│   ├── price_db.py               # Extended product price database
│   ├── product_specs.py          # ★ NEW: Product descriptions, specs, buy links, offline stores
│   └── sentiment.py              # NLP sentiment engine (VADER + TextBlob)
│
└── frontend/
    └── public/
        ├── index.html            # Full SPA HTML
        ├── app.js                # All frontend JS (auth, rendering, charts)
        └── style.css             # Custom CSS
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | No | Create account |
| `POST` | `/api/auth/login` | No | Get JWT token |
| `GET` | `/api/auth/me` | Yes | Get current user |
| `POST` | `/api/analyze` | Yes | Full product analysis |
| `GET` | `/api/history` | Yes | Search history (last 20) |
| `GET` | `/api/stats` | Yes | Verdict statistics |

### `/api/analyze` Response Structure
```json
{
  "query": "iPhone 15",
  "quality_score": 70.1,
  "verdict": "⏳ Wait & Watch",
  "confidence": 60,
  "verdict_detail": "...",

  "product_info": {
    "matched_key": "iphone 15",
    "category": "smartphone",
    "brand": "apple",
    "mrp": 79900,
    "description": "iPhone 15 brings Dynamic Island...",
    "key_highlights": ["A16 Bionic chip", "Dynamic Island", ...],
    "specs": { "Display": "6.1-inch...", "Processor": "A16 Bionic", ... },
    "buy_links": { "Amazon": "https://...", "Flipkart": "https://...", ... }
  },

  "price_intel": { "min": 56999, "avg": 66428, "mrp": 79900, "savings": 28.7 },

  "offline_prices": [
    { "store": "Croma", "price": 75500, "discount_pct": 6, "url": "https://...", "icon": "🔴" },
    { "store": "Reliance Digital", "price": 77000, ... }
  ],

  "price_comparison": {
    "online_best": 56999, "offline_best": 75500,
    "recommendation": "online", "you_save_online": 18501
  },

  "sentiment": {
    "score": 68.2, "polarity": 0.364, "label": "Positive",
    "positive_pct": 66.6, "neutral_pct": 6.7, "negative_pct": 26.6
  },

  "aspects": {
    "quality": { "score": 72.1, "count": 18 },
    "value": { "score": 65.3, "count": 12 },
    ...
  },

  "snippets": [
    { "text": "Camera quality has blown me away...", "label": "Positive", "score": 0.843 }
  ],

  "telemetry": [ ... ],
  "platform_data": { ... }
}
```

---

## ⚙️ Setup & Running

### Requirements
```bash
pip install -r requirements.txt
python -m nltk.downloader vader_lexicon
```

### Development
```bash
# Start with PM2 (recommended)
pm2 start ecosystem.config.cjs

# Or directly
cd backend && python app.py
```

### Environment Variables (`.env`)
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
FLASK_ENV=development
PORT=3000
```

---

## 📊 Supported Products (200+)

| Category | Examples |
|----------|---------|
| **Smartphones** | iPhone 16 Pro Max, Samsung Galaxy S25 Ultra, OnePlus 13, Pixel 9 Pro |
| **Laptops** | MacBook Air M3, Dell XPS 15, ASUS ROG Zephyrus G14 |
| **Audio** | Sony WH-1000XM5, AirPods Pro 2, Bose QC Ultra |
| **Gaming** | PlayStation 5, Xbox Series X, Nintendo Switch OLED |
| **Tablets** | iPad Pro M4, Samsung Galaxy Tab S10+ |
| **Wearables** | Apple Watch Series 10, Samsung Galaxy Watch 7 |
| **TVs** | LG OLED C3, Samsung QD-OLED S95D, Sony Bravia 9 |

---

## 🏪 Supported Offline Stores

| Store | Website |
|-------|---------|
| Croma | croma.com |
| Reliance Digital | reliancedigital.in |
| Vijay Sales | vijaysales.com |
| Poorvika | poorvika.com |
| Apple Store India | apple.com/in |
| Samsung Plaza | samsung.com/in |

---

## 📅 Version History

| Version | Changes |
|---------|---------|
| **v3.0** | Product descriptions, specs, buy links, offline store comparison, dedicated sentiment section |
| **v2.0** | Price Intelligence Engine with live FX rates, accurate Indian market pricing |
| **v1.0** | Initial release: Flask backend, JWT auth, NLP sentiment, multi-platform scraping |

---

*Built with ❤️ for Indian consumers. All prices in INR.*
