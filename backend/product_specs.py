"""
Worthify Product Specifications & Description Database
Detailed product info: descriptions, tech specs, real purchase URLs,
and offline store pricing for major Indian retail chains.
"""

# ─── Offline Store Chains in India ────────────────────────────────────────────
OFFLINE_STORES = {
    "Croma":          {"icon": "🔴", "color": "#e11d48", "url": "https://www.croma.com/searchB?q="},
    "Reliance Digital": {"icon": "🔵", "color": "#2563eb", "url": "https://www.reliancedigital.in/search?q="},
    "Vijay Sales":    {"icon": "🟠", "color": "#ea580c", "url": "https://www.vijaysales.com/search/"},
    "Apple Store":    {"icon": "⚪", "color": "#6b7280", "url": "https://www.apple.com/in/shop/buy-"},
    "Samsung Plaza":  {"icon": "🔷", "color": "#1d4ed8", "url": "https://www.samsung.com/in/smartphones/"},
    "Poorvika":       {"icon": "🟣", "color": "#7c3aed", "url": "https://www.poorvika.com/search?q="},
    "Unicorn Store":  {"icon": "🟡", "color": "#d97706", "url": "https://unicornstore.in/search?q="},
}

# ─── Offline Price Factors per category (vs MRP) ──────────────────────────────
# Offline stores generally have less discount than online
OFFLINE_DISCOUNT_FACTORS = {
    "smartphone": {"Croma": (0.03, 0.08), "Reliance Digital": (0.03, 0.07), "Vijay Sales": (0.04, 0.09), "Poorvika": (0.03, 0.08)},
    "laptop":     {"Croma": (0.04, 0.10), "Reliance Digital": (0.03, 0.08), "Vijay Sales": (0.05, 0.10)},
    "audio":      {"Croma": (0.05, 0.12), "Reliance Digital": (0.04, 0.10), "Vijay Sales": (0.06, 0.13)},
    "wearable":   {"Croma": (0.04, 0.10), "Reliance Digital": (0.03, 0.08), "Vijay Sales": (0.05, 0.11)},
    "tv":         {"Croma": (0.05, 0.12), "Reliance Digital": (0.05, 0.11), "Vijay Sales": (0.06, 0.14)},
    "gaming":     {"Croma": (0.02, 0.07), "Reliance Digital": (0.02, 0.06), "Vijay Sales": (0.03, 0.08)},
    "tablet":     {"Croma": (0.03, 0.08), "Reliance Digital": (0.03, 0.07), "Vijay Sales": (0.04, 0.09)},
    "camera":     {"Croma": (0.04, 0.10), "Vijay Sales": (0.05, 0.11)},
    "appliance":  {"Croma": (0.05, 0.12), "Reliance Digital": (0.04, 0.10), "Vijay Sales": (0.06, 0.13)},
    "default":    {"Croma": (0.03, 0.08), "Reliance Digital": (0.03, 0.07)},
}

# ─── Product Specs & Description Database ─────────────────────────────────────
PRODUCT_SPECS = {

    # ═══════════════ APPLE iPHONE ════════════════════════════════════════════
    "iphone 16 pro max": {
        "description": "The iPhone 16 Pro Max is Apple's most powerful smartphone ever. Featuring the A18 Pro chip, a breathtaking 6.9-inch Super Retina XDR ProMotion display, and a 48MP triple camera system with 5× optical zoom. Camera Control button enables intuitive photography controls. Titanium design with Action Button.",
        "key_highlights": ["A18 Pro chip (3nm)", "6.9″ Super Retina XDR, 120Hz ProMotion", "48MP Fusion + 48MP Ultra Wide + 12MP 5× Telephoto", "Camera Control button", "4685 mAh battery", "iOS 18", "Titanium frame"],
        "specs": {
            "Display": "6.9-inch Super Retina XDR OLED, 2868×1320, 460 ppi, 120Hz ProMotion",
            "Processor": "Apple A18 Pro (3nm), 6-core CPU, 6-core GPU",
            "RAM": "8GB",
            "Storage": "256GB / 512GB / 1TB",
            "Main Camera": "48MP Fusion f/1.78 OIS | 48MP Ultra Wide f/2.2 | 12MP 5× Telephoto f/2.8",
            "Front Camera": "12MP TrueDepth f/1.9, autofocus",
            "Battery": "4685 mAh, 30W MagSafe charging, 25W USB-C fast charge",
            "OS": "iOS 18",
            "Connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, NFC, Ultra Wideband",
            "Build": "Titanium frame, textured matte glass back, Ceramic Shield front",
            "Colors": "Black Titanium, White Titanium, Natural Titanium, Desert Titanium",
            "Weight": "227g",
            "Water Resistance": "IP68 (6 metres, 30 minutes)",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+16+pro+max&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=iphone+16+pro+max&otracker=search",
            "JioMart":  "https://www.jiomart.com/search/iphone+16+pro+max",
            "Official": "https://www.apple.com/in/shop/buy-iphone/iphone-16-pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "smartphone",
    },

    "iphone 16 pro": {
        "description": "iPhone 16 Pro introduces the new Camera Control for intuitive photography, powered by the A18 Pro chip. Features a 6.3-inch ProMotion display, 48MP triple camera system with 5× optical zoom, and all-new titanium design. First iPhone with Wi-Fi 7.",
        "key_highlights": ["A18 Pro chip", "6.3″ 120Hz ProMotion OLED", "Camera Control button", "48MP triple camera", "5× optical zoom", "Wi-Fi 7", "USB-C"],
        "specs": {
            "Display": "6.3-inch Super Retina XDR OLED, 2622×1206, 460 ppi, 120Hz",
            "Processor": "Apple A18 Pro (3nm)",
            "RAM": "8GB",
            "Storage": "128GB / 256GB / 512GB / 1TB",
            "Main Camera": "48MP Fusion f/1.78 | 48MP Ultra Wide | 12MP 5× Telephoto",
            "Front Camera": "12MP TrueDepth f/1.9 autofocus",
            "Battery": "3582 mAh, 27W fast charge",
            "OS": "iOS 18",
            "Connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, NFC",
            "Weight": "199g",
            "Water Resistance": "IP68",
            "Colors": "Black Titanium, White Titanium, Natural Titanium, Desert Titanium",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+16+pro&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=iphone+16+pro",
            "Official": "https://www.apple.com/in/shop/buy-iphone/iphone-16-pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "smartphone",
    },

    "iphone 16": {
        "description": "iPhone 16 brings the Camera Control button and A18 chip to the standard model. Features a 6.1-inch display, 48MP main camera, and Action Button. The first standard iPhone to support Apple Intelligence. Significant generational upgrade for iOS users.",
        "key_highlights": ["A18 chip", "Camera Control", "Action Button", "48MP main camera", "Apple Intelligence", "USB-C"],
        "specs": {
            "Display": "6.1-inch Super Retina XDR OLED, 2556×1179, 460 ppi, 60Hz",
            "Processor": "Apple A18 (3nm)",
            "RAM": "8GB",
            "Storage": "128GB / 256GB / 512GB",
            "Main Camera": "48MP Fusion f/1.6 OIS | 12MP Ultra Wide f/2.2",
            "Front Camera": "12MP TrueDepth f/1.9 autofocus",
            "Battery": "3561 mAh, 25W fast charge",
            "OS": "iOS 18",
            "Connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, NFC",
            "Weight": "170g",
            "Water Resistance": "IP68",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+16&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=iphone+16",
            "Myntra":   "https://www.myntra.com/iphone-16",
            "Official": "https://www.apple.com/in/shop/buy-iphone/iphone-16",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "smartphone",
    },

    "iphone 15 pro max": {
        "description": "iPhone 15 Pro Max features a titanium design, the A17 Pro chip, and 5× optical zoom for the first time. A USB-C port replaces Lightning, and the customizable Action Button debuts. The ProMotion OLED display delivers stunning clarity.",
        "key_highlights": ["A17 Pro chip (3nm)", "Titanium design", "5× optical zoom", "USB-C", "Action Button", "48MP main camera"],
        "specs": {
            "Display": "6.7-inch Super Retina XDR ProMotion OLED, 2796×1290, 460 ppi, 120Hz",
            "Processor": "Apple A17 Pro (3nm)",
            "RAM": "8GB",
            "Storage": "256GB / 512GB / 1TB",
            "Main Camera": "48MP Main f/1.78 | 12MP Ultra Wide | 12MP 5× Telephoto",
            "Battery": "4422 mAh",
            "OS": "iOS 17 (upgradeable to iOS 18)",
            "Weight": "221g",
            "Water Resistance": "IP68",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+15+pro+max&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=iphone+15+pro+max",
            "Official": "https://www.apple.com/in/shop/buy-iphone/iphone-15-pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "smartphone",
    },

    "iphone 15 pro": {
        "description": "iPhone 15 Pro introduced titanium construction, USB-C, and the Action Button. Powered by A17 Pro, it delivers console-level gaming and pro camera performance including 4K 60fps ProRes video. Best iPhone for creators.",
        "key_highlights": ["A17 Pro chip", "Titanium build", "USB-C with USB 3 speeds", "Action Button", "ProRes 4K 60fps video", "48MP main camera"],
        "specs": {
            "Display": "6.1-inch Super Retina XDR ProMotion, 2556×1179, 460 ppi, 120Hz",
            "Processor": "Apple A17 Pro (3nm)",
            "RAM": "8GB",
            "Storage": "128GB / 256GB / 512GB / 1TB",
            "Main Camera": "48MP Main f/1.78 | 12MP Ultra Wide | 12MP 3× Telephoto",
            "Battery": "3274 mAh",
            "OS": "iOS 17 (iOS 18)",
            "Weight": "187g",
            "Water Resistance": "IP68",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+15+pro&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=iphone+15+pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "smartphone",
    },

    "iphone 15": {
        "description": "iPhone 15 brings Dynamic Island and 48MP camera to the mainstream. USB-C replaces Lightning for the first time. Powered by A16 Bionic and featuring a durable Ceramic Shield front, it's the best standard iPhone Apple has made.",
        "key_highlights": ["A16 Bionic chip", "Dynamic Island", "48MP main camera", "USB-C", "Ceramic Shield", "Smart HDR 5"],
        "specs": {
            "Display": "6.1-inch Super Retina XDR OLED, 2556×1179, 460 ppi, 60Hz",
            "Processor": "Apple A16 Bionic",
            "RAM": "6GB",
            "Storage": "128GB / 256GB / 512GB",
            "Main Camera": "48MP Main f/1.6 OIS | 12MP Ultra Wide f/2.4",
            "Front Camera": "12MP TrueDepth",
            "Battery": "3349 mAh",
            "OS": "iOS 17 (iOS 18)",
            "Weight": "171g",
            "Water Resistance": "IP68",
            "Colors": "Black, Blue, Green, Yellow, Pink",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=iphone+15+128gb&i=electronics&rh=p_89%3AApple",
            "Flipkart": "https://www.flipkart.com/search?q=apple+iphone+15+128gb&otracker=search",
            "Myntra":   "https://www.myntra.com/apple-iphone-15",
            "JioMart":  "https://www.jiomart.com/search/iphone+15",
            "Official": "https://www.apple.com/in/shop/buy-iphone/iphone-15",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store", "Poorvika"],
        "category": "smartphone",
    },

    "samsung galaxy s24 ultra": {
        "description": "Galaxy S24 Ultra is Samsung's flagship powerhouse with built-in S Pen, 200MP camera, and Galaxy AI features. The titanium frame and flat display set a new design language. With 12GB RAM and Snapdragon 8 Gen 3, it handles every task effortlessly.",
        "key_highlights": ["Snapdragon 8 Gen 3", "200MP main camera", "Built-in S Pen", "12GB RAM", "Galaxy AI", "Titanium frame", "6.8-inch QHD+ 120Hz"],
        "specs": {
            "Display": "6.8-inch Dynamic AMOLED 2X, QHD+ 3088×1440, 120Hz adaptive",
            "Processor": "Snapdragon 8 Gen 3 for Galaxy",
            "RAM": "12GB",
            "Storage": "256GB / 512GB / 1TB",
            "Main Camera": "200MP HP9 f/1.7 | 12MP Ultra Wide | 10MP 3× Tele | 50MP 5× Tele",
            "Front Camera": "12MP f/2.2",
            "Battery": "5000 mAh, 45W fast charge, 15W wireless",
            "OS": "Android 14, One UI 6.1",
            "Connectivity": "5G, Wi-Fi 7, Bluetooth 5.3, NFC, UWB, S Pen",
            "Weight": "232g",
            "Water Resistance": "IP68",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=samsung+galaxy+s24+ultra&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=samsung+galaxy+s24+ultra",
            "Official": "https://www.samsung.com/in/smartphones/galaxy-s/",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Samsung Plaza"],
        "category": "smartphone",
    },

    "samsung galaxy s24": {
        "description": "Galaxy S24 is Samsung's compact flagship with the powerful Exynos 2400 processor and Galaxy AI. Features a 50MP main camera, bright AMOLED display, and 7 years of OS updates — making it one of the best long-term Android investments.",
        "key_highlights": ["Exynos 2400 (10-core)", "50MP triple camera", "6.2-inch 120Hz AMOLED", "Galaxy AI", "7 years OS support", "Bright aluminum frame"],
        "specs": {
            "Display": "6.2-inch Dynamic AMOLED 2X, FHD+ 2340×1080, 120Hz adaptive",
            "Processor": "Exynos 2400 / Snapdragon 8 Gen 3",
            "RAM": "8GB",
            "Storage": "128GB / 256GB",
            "Main Camera": "50MP f/1.8 OIS | 12MP Ultra Wide | 10MP 3× Telephoto",
            "Front Camera": "12MP f/2.2",
            "Battery": "4000 mAh, 25W fast charge, 15W wireless",
            "OS": "Android 14, One UI 6.1 (7 years updates)",
            "Weight": "167g",
            "Water Resistance": "IP68",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=samsung+galaxy+s24&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=samsung+galaxy+s24",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Samsung Plaza"],
        "category": "smartphone",
    },

    "oneplus 12": {
        "description": "OnePlus 12 delivers flagship performance with the Snapdragon 8 Gen 3, co-engineered Hasselblad cameras, and a stunning 6.82-inch AMOLED display. The 100W SUPERVOOC charging fills the massive 5400 mAh battery in 26 minutes.",
        "key_highlights": ["Snapdragon 8 Gen 3", "Hasselblad triple camera", "100W SUPERVOOC", "16GB RAM", "5400 mAh battery", "1-450 nits adaptive 120Hz"],
        "specs": {
            "Display": "6.82-inch LTPO AMOLED, QHD+ 3168×1440, 1-120Hz adaptive",
            "Processor": "Snapdragon 8 Gen 3",
            "RAM": "12GB / 16GB",
            "Storage": "256GB / 512GB",
            "Main Camera": "50MP Sony LYT-808 f/1.6 OIS | 48MP Ultra Wide | 64MP 3× Telephoto",
            "Front Camera": "32MP f/2.4",
            "Battery": "5400 mAh, 100W SUPERVOOC, 50W wireless",
            "OS": "OxygenOS 14 (Android 14)",
            "Weight": "220g",
            "Water Resistance": "IP65",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=oneplus+12&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=oneplus+12",
            "Official": "https://www.oneplus.in/12",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "smartphone",
    },

    # ═══════════════ MACBOOKS ═════════════════════════════════════════════════
    "macbook air 15 m3": {
        "description": "MacBook Air 15-inch with M3 chip is the world's best 15-inch laptop — fanless, stunningly thin, and capable. The 15.3-inch Liquid Retina display with 500 nits brightness is perfect for productivity and creativity. Up to 18 hours of battery life.",
        "key_highlights": ["M3 chip (8-core CPU, 10-core GPU)", "15.3-inch Liquid Retina display", "18-hour battery", "Fanless design", "1080p FaceTime HD camera", "MagSafe 3 charging"],
        "specs": {
            "Display": "15.3-inch Liquid Retina, 2880×1864, 224 ppi, 500 nits, P3 wide color",
            "Processor": "Apple M3 (8-core CPU, 10-core GPU)",
            "RAM": "8GB / 16GB / 24GB unified memory",
            "Storage": "256GB / 512GB / 1TB / 2TB SSD",
            "Battery": "66.5 Wh, up to 18 hours, 35W dual USB-C fast charge",
            "Ports": "2× Thunderbolt 3 (USB-C), MagSafe 3, 3.5mm headphone jack",
            "OS": "macOS Sonoma",
            "Weight": "1.51 kg",
            "Dimensions": "34.04 × 23.76 × 1.15 cm",
            "Webcam": "1080p FaceTime HD",
            "Colors": "Midnight, Starlight, Space Gray, Silver",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=macbook+air+15+m3&i=computers",
            "Flipkart": "https://www.flipkart.com/search?q=macbook+air+15+m3",
            "Official": "https://www.apple.com/in/shop/buy-mac/macbook-air/15-inch",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "laptop",
    },

    "macbook air 13 m3": {
        "description": "MacBook Air 13 with M3 is Apple's most popular laptop — incredibly light at 1.24 kg, yet powerful enough for demanding workflows. Supports two external displays when lid is closed. Wi-Fi 6E and Bluetooth 5.3.",
        "key_highlights": ["M3 chip", "13.6-inch 500-nit Liquid Retina", "18-hour battery", "1.24 kg fanless design", "Dual external display support", "Wi-Fi 6E"],
        "specs": {
            "Display": "13.6-inch Liquid Retina, 2560×1664, 224 ppi, 500 nits",
            "Processor": "Apple M3 (8-core CPU, up to 10-core GPU)",
            "RAM": "8GB / 16GB / 24GB",
            "Storage": "256GB / 512GB / 1TB / 2TB",
            "Battery": "52.6 Wh, up to 18 hours",
            "Weight": "1.24 kg",
            "OS": "macOS Sonoma",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=macbook+air+13+m3&i=computers",
            "Flipkart": "https://www.flipkart.com/search?q=macbook+air+13+m3",
            "Official": "https://www.apple.com/in/shop/buy-mac/macbook-air",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "laptop",
    },

    # ═══════════════ AUDIO ════════════════════════════════════════════════════
    "sony wh-1000xm5": {
        "description": "Sony WH-1000XM5 redefines noise cancellation with 8 microphones and dual processors. Industry-leading ANC combined with 30-hour battery and crystal-clear 360 Reality Audio make this the gold standard in wireless headphones.",
        "key_highlights": ["Industry-leading ANC (8 mics)", "30-hour battery", "Multipoint connection (2 devices)", "Speak-to-Chat", "360 Reality Audio", "Hi-Res Audio Wireless (LDAC)"],
        "specs": {
            "Driver": "30mm, Soft-fit leather cushions",
            "Frequency Response": "4–40,000 Hz (Hi-Res Audio)",
            "ANC": "8 microphones, 2 processors (QN1 HD + QN2)",
            "Battery Life": "30 hours (ANC on), 40 hours (ANC off)",
            "Charging": "USB-C, 3 min charge = 3 hours playback",
            "Connectivity": "Bluetooth 5.2, LDAC, AAC, SBC, 3.5mm jack",
            "Weight": "250g",
            "Multipoint": "2 devices simultaneously",
            "Foldable": "No (flat fold for portability)",
            "Colors": "Midnight Black, Platinum Silver",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=sony+wh-1000xm5&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=sony+wh-1000xm5",
            "Official": "https://www.sony.co.in/en/articles/wh-1000xm5-headphones",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "audio",
    },

    "airpods pro 2": {
        "description": "AirPods Pro 2nd gen deliver the most advanced ANC Apple has ever created — 2× better than the original. Adaptive Audio intelligently blends ANC and Transparency. The H2 chip powers Personalized Spatial Audio with head tracking.",
        "key_highlights": ["H2 chip", "2× better ANC than Gen 1", "Adaptive Audio", "Personalized Spatial Audio", "USB-C charging case", "30 hours total battery"],
        "specs": {
            "Chip": "Apple H2",
            "ANC": "2× better than AirPods Pro 1st gen, Adaptive Transparency",
            "Battery": "6 hrs (ANC on) / 30 hrs with case",
            "Charging": "USB-C, MagSafe, Qi wireless, Apple Watch charger",
            "Connectivity": "Bluetooth 5.3",
            "Water Resistance": "IPX4 (earbuds + case)",
            "Audio": "Personalized Spatial Audio, Adaptive EQ",
            "Find My": "Precision Finding with Ultra Wideband",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=airpods+pro+2nd+generation&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=airpods+pro+2",
            "Official": "https://www.apple.com/in/shop/buy-airpods/airpods-pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "audio",
    },

    # ═══════════════ GAMING ══════════════════════════════════════════════════
    "playstation 5": {
        "description": "PlayStation 5 delivers a revolutionary gaming experience with ultra-fast SSD, haptic feedback and adaptive triggers in the DualSense controller, and 4K HDR gaming at up to 120fps. The custom AMD GPU ensures breathtaking visuals across every PS5 exclusive.",
        "key_highlights": ["Custom AMD Zen 2 + RDNA 2 GPU", "Ultra-HD Blu-ray drive", "825GB custom SSD (5.5 GB/s)", "4K@120fps gaming", "DualSense haptic feedback + adaptive triggers", "PS5 exclusive library"],
        "specs": {
            "CPU": "Custom AMD Zen 2, 8 cores @ 3.5 GHz",
            "GPU": "Custom AMD RDNA 2, 10.28 TFLOPS, 36 CUs @ 2.23 GHz",
            "RAM": "16GB GDDR6",
            "Storage": "825GB NVMe SSD (5.5 GB/s), M.2 expansion slot",
            "Optical Drive": "Ultra HD 4K Blu-ray",
            "Resolution": "Up to 8K (4K@120fps, 1080p@120fps)",
            "HDR": "Yes",
            "Ray Tracing": "Yes (hardware accelerated)",
            "Controller": "DualSense (haptic feedback, adaptive triggers)",
            "Connectivity": "Wi-Fi 6, Bluetooth 5.1, USB-A/C, HDMI 2.1",
            "Dimensions": "390 × 260 × 104 mm",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=playstation+5&i=videogames",
            "Flipkart": "https://www.flipkart.com/search?q=playstation+5",
            "JioMart":  "https://www.jiomart.com/search/playstation+5",
            "Official": "https://www.playstation.com/en-in/ps5/",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "gaming",
    },

    "playstation 5 slim": {
        "description": "PS5 Slim is 30% smaller and 24% lighter than the original PS5, making it the perfect compact gaming powerhouse. Same A18 Pro-level performance, ultra-fast SSD, and DualSense controller. Now with a detachable disc drive option.",
        "key_highlights": ["30% smaller than original PS5", "Detachable disc drive", "Same PS5 performance", "DualSense controller", "825GB SSD"],
        "specs": {
            "CPU": "Custom AMD Zen 2, 8 cores @ 3.5 GHz",
            "GPU": "Custom AMD RDNA 2, 10.28 TFLOPS",
            "RAM": "16GB GDDR6",
            "Storage": "1TB NVMe SSD",
            "Optical Drive": "Detachable Ultra HD Blu-ray (disc edition)",
            "Resolution": "Up to 8K support, 4K@120fps",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=ps5+slim&i=videogames",
            "Flipkart": "https://www.flipkart.com/search?q=ps5+slim",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "gaming",
    },

    # ═══════════════ LAPTOPS ═════════════════════════════════════════════════
    "dell xps 15": {
        "description": "Dell XPS 15 is the pinnacle of Windows laptop engineering — a stunning InfinityEdge OLED display, 13th Gen Intel Core i7/i9, NVIDIA RTX 40-series graphics in a slim premium chassis. Perfect for creators and professionals.",
        "key_highlights": ["13th Gen Intel Core i7/i9 H-series", "NVIDIA RTX 4050/4060 GPU", "15.6-inch OLED 3.5K display", "Up to 64GB DDR5", "Thunderbolt 4", "SD card slot"],
        "specs": {
            "Display": "15.6-inch 3.5K OLED (3456×2160) 60Hz or FHD+ 60Hz/IPS",
            "Processor": "Intel Core i7-13700H / i9-13900H",
            "GPU": "NVIDIA GeForce RTX 4050 / RTX 4060 (6GB)",
            "RAM": "16GB / 32GB / 64GB DDR5",
            "Storage": "512GB / 1TB / 2TB NVMe SSD",
            "Battery": "86 Wh, 130W USB-C fast charge",
            "Ports": "2× Thunderbolt 4, USB-C, SD card, 3.5mm",
            "OS": "Windows 11 Home / Pro",
            "Weight": "1.86 kg",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=dell+xps+15&i=computers",
            "Flipkart": "https://www.flipkart.com/search?q=dell+xps+15",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "laptop",
    },

    "asus rog zephyrus g14": {
        "description": "ASUS ROG Zephyrus G14 is the world's most powerful 14-inch gaming laptop. AMD Ryzen 9 + NVIDIA RTX 4070 in a 1.65 kg chassis. The Mini LED display with 165Hz refresh and ROG Nebula HDR delivers cinema-quality gaming visuals.",
        "key_highlights": ["AMD Ryzen 9 8945HS", "NVIDIA RTX 4070 8GB", "14-inch 3K 165Hz OLED/Mini LED", "1.65 kg", "Triple-fan cooling", "MUX Switch"],
        "specs": {
            "Display": "14-inch OLED / Mini LED QHD+ 2880×1800, 165Hz",
            "Processor": "AMD Ryzen 9 8945HS (Zen 4, 8 cores)",
            "GPU": "NVIDIA GeForce RTX 4070 8GB GDDR6",
            "RAM": "16GB / 32GB DDR5",
            "Storage": "1TB / 2TB PCIe 4.0 NVMe",
            "Battery": "73 Wh, 140W USB-C PD",
            "Weight": "1.65 kg",
            "Cooling": "Triple-fan + Liquid Metal compound",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=asus+rog+zephyrus+g14&i=computers",
            "Flipkart": "https://www.flipkart.com/search?q=asus+rog+zephyrus+g14",
        },
        "offline_stores": ["Croma", "Reliance Digital"],
        "category": "laptop",
    },

    # ═══════════════ TABLETS ══════════════════════════════════════════════════
    "ipad pro 11 m4": {
        "description": "iPad Pro 11 M4 is Apple's most advanced iPad ever — impossibly thin at 5.3mm and featuring the Ultra Retina XDR OLED tandem display with nano-texture glass option. The M4 chip delivers AI performance previously reserved for Macs.",
        "key_highlights": ["M4 chip", "Ultra Retina XDR tandem OLED", "5.3mm thin (thinnest Apple product ever)", "Apple Pencil Pro support", "Magic Keyboard Folio", "Landscape TrueDepth camera"],
        "specs": {
            "Display": "11-inch Ultra Retina XDR Tandem OLED, 2420×1668, 264 ppi, 1000 nits (full screen)",
            "Processor": "Apple M4 (10-core CPU, 10-core GPU)",
            "RAM": "8GB / 16GB",
            "Storage": "256GB / 512GB / 1TB / 2TB",
            "Camera": "12MP Main + 12MP Ultra Wide (rear), 12MP landscape TrueDepth (front)",
            "Battery": "31.29 Wh, 20W charge",
            "Connectivity": "Wi-Fi 7, Bluetooth 5.3, USB-C (Thunderbolt 4)",
            "Thickness": "5.3mm",
            "Weight": "444g (Wi-Fi)",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=ipad+pro+11+m4&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=ipad+pro+11+m4",
            "Official": "https://www.apple.com/in/shop/buy-ipad/ipad-pro",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Apple Store"],
        "category": "tablet",
    },

    # ═══════════════ TVs ═════════════════════════════════════════════════════
    "lg oled c3 65": {
        "description": "LG OLED C3 65-inch is the benchmark OLED TV. Self-lit OLED pixels deliver perfect blacks and infinite contrast. α9 AI Processor Gen6 optimizes picture and sound for any content. G-Sync and FreeSync Premium Pro make it the best gaming TV.",
        "key_highlights": ["Self-lit OLED evo pixels", "α9 AI Gen6 processor", "4K 120Hz", "G-Sync + FreeSync Premium Pro", "Dolby Vision IQ + Dolby Atmos", "webOS 23 Smart TV"],
        "specs": {
            "Display": "65-inch OLED evo, 4K UHD 3840×2160, 120Hz",
            "Processor": "α9 AI Processor Gen6",
            "HDR": "Dolby Vision IQ, HDR10, HLG",
            "Audio": "60W 2.2ch, Dolby Atmos",
            "Smart TV": "webOS 23",
            "Gaming": "4K@120Hz, G-Sync, FreeSync Premium Pro, VRR, ALLM, 1.1ms GtG",
            "HDMI": "4× HDMI 2.1",
            "Thickness": "45.8mm (excl. stand)",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=lg+oled+c3+65+inch&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=lg+oled+c3+65",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales"],
        "category": "tv",
    },

    # ═══════════════ WEARABLES ════════════════════════════════════════════════
    "apple watch series 10": {
        "description": "Apple Watch Series 10 is the thinnest and lightest Apple Watch ever — 10% thinner than Series 9. Faster charging, a wider display, and the new S10 chip. Advanced health sensors including sleep apnea detection now approved for India.",
        "key_highlights": ["Thinnest Apple Watch ever", "Advanced sleep apnea detection", "Wide 46mm display", "18-hour battery (36hr in low power)", "Fast charge (80% in 30 min)", "S10 chip"],
        "specs": {
            "Display": "46mm or 42mm LTPO OLED, always-on, up to 2000 nits",
            "Chip": "S10 SiP",
            "Health": "ECG, Blood Oxygen, Sleep apnea detection, Heart Rate",
            "Battery": "18 hours typical, 36 hours low power",
            "Charging": "Magnetic fast charge (80% in 30 min)",
            "Connectivity": "Bluetooth 5.3, Wi-Fi 6, LTE (optional), UWB",
            "Water Resistance": "50m swimproof",
            "OS": "watchOS 11",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=apple+watch+series+10&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=apple+watch+series+10",
            "Official": "https://www.apple.com/in/shop/buy-watch/apple-watch",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Vijay Sales", "Apple Store"],
        "category": "wearable",
    },

    "samsung galaxy watch 7": {
        "description": "Galaxy Watch 7 features Samsung's most advanced BioActive Sensor with AI-powered health coaching. Built on the Exynos W1000 chip — Galaxy's first 3nm wearable processor. Advanced sleep tracking, energy score, and race track mode.",
        "key_highlights": ["Exynos W1000 (3nm)", "Advanced AI health coaching", "Energy Score", "Race Track Mode", "40h battery (power saving)", "sapphire crystal glass"],
        "specs": {
            "Display": "1.5-inch (44mm) / 1.3-inch (40mm) Super AMOLED",
            "Chip": "Exynos W1000 (3nm)",
            "Battery": "425 mAh (44mm) / 300 mAh (40mm), 40h extended battery",
            "Health": "BioActive sensor (HR, SpO2, ECG, body composition), sleep apnea",
            "Connectivity": "Bluetooth 5.3, Wi-Fi 6, LTE (optional), NFC",
            "OS": "Wear OS 5.0 + One UI Watch 6.0",
            "Water Resistance": "5ATM + IP68 + MIL-STD-810",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=samsung+galaxy+watch+7&i=electronics",
            "Flipkart": "https://www.flipkart.com/search?q=samsung+galaxy+watch+7",
        },
        "offline_stores": ["Croma", "Reliance Digital", "Samsung Plaza"],
        "category": "wearable",
    },

    # ═══════════════ APPLIANCES ═══════════════════════════════════════════════
    "dyson v15 detect": {
        "description": "Dyson V15 Detect is the most powerful Dyson cordless vacuum. The laser reveals invisible dust on hard floors. Piezo-electric sensor counts and sizes particles, adapting suction automatically. HEPA filtration captures 99.99% of particles.",
        "key_highlights": ["Dyson Hyperdymium motor (125,000 RPM)", "Laser Slim Fluffy head reveals invisible dust", "Piezo sensor auto-adjusts suction", "HEPA whole-machine filtration", "60-min runtime", "LCD screen"],
        "specs": {
            "Motor": "Dyson Hyperdymium, 125,000 RPM",
            "Suction": "230 AW",
            "Bin Volume": "0.77L",
            "Battery": "7-cell Li-ion, up to 60 min (Eco mode)",
            "Filtration": "HEPA H13 (captures 99.99% of 0.3μm particles)",
            "Weight": "3.1 kg",
            "Charging": "~4.5 hours",
            "Display": "LCD screen (runtime, maintenance alerts)",
        },
        "buy_links": {
            "Amazon":   "https://www.amazon.in/s?k=dyson+v15+detect&i=garden",
            "Flipkart": "https://www.flipkart.com/search?q=dyson+v15+detect",
            "Official": "https://www.dyson.in/vacuum-cleaners/cordless",
        },
        "offline_stores": ["Croma", "Reliance Digital"],
        "category": "appliance",
    },
}


def get_product_specs(query: str) -> dict:
    """
    Look up product specs and description by query string.
    Returns the spec dict if found, else a minimal placeholder.
    """
    q = query.strip().lower()

    # Direct match
    if q in PRODUCT_SPECS:
        return PRODUCT_SPECS[q]

    # Token overlap
    q_tokens = set(q.split())
    best_key, best_score = None, 0
    for key in PRODUCT_SPECS:
        k_tokens = set(key.split())
        overlap = len(q_tokens & k_tokens)
        union = len(q_tokens | k_tokens)
        score = overlap / union if union > 0 else 0
        if q in key or key in q:
            score += 0.5
        if overlap >= 2 and score > best_score:
            best_score = score
            best_key = key

    if best_key and best_score >= 0.25:
        return PRODUCT_SPECS[best_key]

    return {}


def get_offline_prices(mrp: int, category: str, query: str) -> list:
    """
    Generate realistic offline store prices for a product.
    Offline prices are generally 3-14% less than MRP (less discount than online).
    Returns list of {store, price, discount_pct, url, icon, color, availability}.
    """
    import random
    cat = category.lower()
    store_factors = OFFLINE_DISCOUNT_FACTORS.get(cat, OFFLINE_DISCOUNT_FACTORS["default"])
    q_encoded = query.replace(" ", "+")

    results = []
    for store_name, (d_lo, d_hi) in store_factors.items():
        discount = random.uniform(d_lo, d_hi)
        price = round(mrp * (1 - discount))
        # Round to common pricing points
        if price > 10000:
            price = round(price / 500) * 500
        elif price > 1000:
            price = round(price / 100) * 100

        disc_pct = round((mrp - price) / mrp * 100)
        store_info = OFFLINE_STORES.get(store_name, {})
        base_url = store_info.get("url", "https://www.google.com/search?q=")

        # Build store-specific search URL
        if store_name == "Apple Store":
            url = f"https://www.apple.com/in/shop/buy-{category}"
        elif store_name == "Samsung Plaza":
            url = f"https://www.samsung.com/in/smartphones/"
        else:
            url = base_url + q_encoded

        results.append({
            "store":        store_name,
            "price":        price,
            "discount_pct": disc_pct,
            "url":          url,
            "icon":         store_info.get("icon", "🏪"),
            "color":        store_info.get("color", "#6b7280"),
            "availability": "Available" if random.random() > 0.1 else "Limited Stock",
            "type":         "offline",
        })

    # Sort by price ascending
    results.sort(key=lambda x: x["price"])
    return results
