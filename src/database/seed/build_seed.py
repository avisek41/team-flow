#!/usr/bin/env python3
"""Build dynamic_ui_seed.json with all 6 supported city packs."""
import json
from pathlib import Path

SRC = Path("/Users/avisek/Desktop/dynamic_ui_final.json")
OUT = Path(__file__).with_name("dynamic_ui_seed.json")

src = json.loads(SRC.read_text(encoding="utf-8"))

src["salary_cycles"]["premium"]["trigger_days"] = [1, 2, 3, 4, 5]
src["salary_cycles"]["savings"]["trigger_days"] = [25, 26, 27, 28, 29, 30, 31]
src["salary_cycles"]["normal"]["trigger_days"] = list(range(6, 25))

src["_meta"]["version"] = "3.1.0"
src["_meta"]["total_combinations"] = (
    "6 cities × 4 phases × 3 salary states × festival calendar"
)
src["_meta"]["endpoint"] = "GET /api/v1/ui-config"
src["_meta"]["supported_cities"] = [
    "ahmedabad",
    "mumbai",
    "odisha",
    "delhi",
    "bengaluru",
    "hyderabad",
]

mum = src["cities"]["mumbai"]
mum["language"]["locale"] = "mr-IN + en-IN"
mum["language"]["script"] = "Devanagari (Marathi) + Latin"
mum["language"]["style"] = "English-Marathi blend — natural Mumbai food language"
mum["language"]["tagline"] = "आमची मुंबई · Aamchi Mumbai · Local favourites"
mum["language"]["search_placeholder"] = (
    "Vada pav, misal, biryani, cutting chai शोधा..."
)
mum["language"]["salary_messages"]["normal"] = (
    "Mid-month — regular Mumbai favourites order करा 🍴"
)
mum["language"]["greetings"] = {
    "morning": {
        "line1": "Good morning! सुप्रभात!",
        "line2": "Cutting chai + something solid? ☀️",
    },
    "afternoon": {
        "line1": "Kay chalay?",
        "line2": "Lunch ready aahe का? 🍱",
    },
    "evening": {
        "line1": "Sandhyakaal!",
        "line2": "Office के बाद काय खाऊ? 🌆",
    },
    "night": {
        "line1": "Raatri hunger?",
        "line2": "Late night Mumbai cravings 🌙",
    },
}

src["cities"]["odisha"]["display_name"] = "Bhubaneswar, Odisha"
src["cities"]["odisha"]["language"]["salary_messages"]["normal"] = (
    "Regular day — Odia thali / pakhala order kara 🍚"
)
src["cities"]["ahmedabad"]["language"]["salary_messages"]["normal"] = (
    "Normal day — thali ke farsaan, kem cho! 🥗"
)

delhi = {
    "id": "delhi",
    "display_name": "Delhi, Delhi",
    "accent_color": "#D32F2F",
    "accent_light": "#EF5350",
    "is_pure_veg_market": False,
    "language": {
        "locale": "hi-IN + en-IN",
        "script": "Devanagari + Latin",
        "style": "English-Hindi blend — natural Delhi Hinglish",
        "tagline": "Dilli ka swaad · दिल्ली का स्वाद · Apne style ka khaana",
        "search_placeholder": "Biryani, chole bhature, momos, parathe khojo...",
        "greetings": {
            "morning": {
                "line1": "Good morning, Dilli!",
                "line2": "Parathe + chai se start? ☀️",
            },
            "afternoon": {
                "line1": "Kya scene hai?",
                "line2": "Lunch mein chole bhature? 🍱",
            },
            "evening": {
                "line1": "Shaam ho gayi yaar!",
                "line2": "Momos ya chaat? 🌆",
            },
            "night": {
                "line1": "Raat ke 12 baj gaye?",
                "line2": "Butter chicken craving? 🌙",
            },
        },
        "salary_messages": {
            "premium": "Salary aa gayi! Aaj kuch solid try karo 💸",
            "normal": "Mid-month — usual Dilli favourites hi best hain 🍽️",
            "savings": "Month-end — deals maar lo, budget bachao 🤑",
        },
        "local_spotlight": {
            "emoji": "🥟",
            "title": "Momos & Chaat Lane",
            "sub": "Hudson Lane to Chandni Chowk — evening rush specials",
        },
        "ui_labels": {
            "offers_section": "Offers & Deals",
            "categories_section": "Categories · कैटेगरी",
            "trending_section": "🔥 Trending in Dilli",
            "nearby_section": "Best Near You",
            "filter_btn": "Filter",
            "see_all": "See all →",
            "view_all": "View all",
            "order_btn": "Order →",
            "explore_btn": "Explore",
            "save_btn": "Save",
        },
    },
    "categories": {
        "morning": [
            {"emoji": "🫓", "label": "Paratha", "filter": "paratha"},
            {"emoji": "☕", "label": "Chai", "filter": "chai"},
            {"emoji": "🥪", "label": "Sandwich", "filter": "sandwich"},
            {"emoji": "🧃", "label": "Juice", "filter": "juice"},
            {"emoji": "🥐", "label": "Bakery", "filter": "bakery"},
        ],
        "afternoon": [
            {"emoji": "🍛", "label": "Chole Bhature", "filter": "chole_bhature"},
            {"emoji": "🍚", "label": "Biryani", "filter": "biryani"},
            {"emoji": "🥗", "label": "Thali", "filter": "thali"},
            {"emoji": "🌮", "label": "Rolls", "filter": "rolls"},
            {"emoji": "🍜", "label": "Chinese", "filter": "chinese"},
        ],
        "evening": [
            {"emoji": "🥟", "label": "Momos", "filter": "momos"},
            {"emoji": "🥜", "label": "Chaat", "filter": "chaat"},
            {"emoji": "🥙", "label": "Kebabs", "filter": "kebabs"},
            {"emoji": "🍵", "label": "Kulhad Chai", "filter": "kulhad_chai"},
            {"emoji": "🍬", "label": "Mithai", "filter": "mithai"},
        ],
        "night": [
            {"emoji": "🍗", "label": "Butter Chicken", "filter": "butter_chicken"},
            {"emoji": "🍕", "label": "Pizza", "filter": "pizza"},
            {"emoji": "🍔", "label": "Burgers", "filter": "burgers"},
            {"emoji": "🥟", "label": "Momos", "filter": "momos"},
            {"emoji": "🧋", "label": "Drinks", "filter": "drinks"},
        ],
    },
    "trending_tags": [
        "🫓 Aloo Paratha",
        "🥟 Chicken Momos",
        "🍛 Chole Bhature",
        "🍗 Butter Chicken",
    ],
    "restaurants": [],
}

bengaluru = {
    "id": "bengaluru",
    "display_name": "Bengaluru, Karnataka",
    "accent_color": "#1565C0",
    "accent_light": "#42A5F5",
    "is_pure_veg_market": False,
    "language": {
        "locale": "kn-IN + en-IN",
        "script": "Kannada (ಕನ್ನಡ) + Latin",
        "style": "English-Kannada blend — natural Bengaluru food language",
        "tagline": "ಬೆಂಗಳೂರು ಊಟ · Bengaluru Oota · Namma food, namma style",
        "search_placeholder": "Dosa, idli, biryani, meals ಹುಡುಕಿ...",
        "greetings": {
            "morning": {
                "line1": "Good morning! ಶುಭೋದಯ!",
                "line2": "Filter coffee + dosa? ☀️",
            },
            "afternoon": {
                "line1": "En agta ide?",
                "line2": "Meals / biryani time! 🍱",
            },
            "evening": {
                "line1": "Sanjeya vela!",
                "line2": "Snacks + chai? 🌆",
            },
            "night": {
                "line1": "Late night hunger?",
                "line2": "Biryani illa andre pizza? 🌙",
            },
        },
        "salary_messages": {
            "premium": "Salary bandide! Treat yourself — premium oota 💸",
            "normal": "Mid-month — namma regular favourites 🍽️",
            "savings": "Month end — deals catch maadi 🤑",
        },
        "local_spotlight": {
            "emoji": "☕",
            "title": "Filter Coffee Trail",
            "sub": "VV Puram to Indiranagar — morning strong decoction",
        },
        "ui_labels": {
            "offers_section": "Offers & Deals",
            "categories_section": "Categories · ವಿಭಾಗ",
            "trending_section": "🔥 Trending in Namma City",
            "nearby_section": "Best Near You",
            "filter_btn": "Filter",
            "see_all": "See all →",
            "view_all": "View all",
            "order_btn": "Order →",
            "explore_btn": "Explore",
            "save_btn": "Save",
        },
    },
    "categories": {
        "morning": [
            {"emoji": "🥞", "label": "Dosa", "filter": "dosa"},
            {"emoji": "🍚", "label": "Idli", "filter": "idli"},
            {"emoji": "☕", "label": "Filter Coffee", "filter": "filter_coffee"},
            {"emoji": "🍩", "label": "Vada", "filter": "vada"},
            {"emoji": "🧃", "label": "Juice", "filter": "juice"},
        ],
        "afternoon": [
            {"emoji": "🍱", "label": "Meals", "filter": "meals"},
            {"emoji": "🍚", "label": "Biryani", "filter": "biryani"},
            {"emoji": "🍛", "label": "Rice Bath", "filter": "rice_bath"},
            {"emoji": "🥗", "label": "Thali", "filter": "thali"},
            {"emoji": "🌮", "label": "Rolls", "filter": "rolls"},
        ],
        "evening": [
            {"emoji": "🥟", "label": "Momos", "filter": "momos"},
            {"emoji": "☕", "label": "Chai", "filter": "chai"},
            {"emoji": "🥜", "label": "Chaat", "filter": "chaat"},
            {"emoji": "🥐", "label": "Bakery", "filter": "bakery"},
            {"emoji": "🍧", "label": "Ice Cream", "filter": "ice_cream"},
        ],
        "night": [
            {"emoji": "🍚", "label": "Biryani", "filter": "biryani"},
            {"emoji": "🍕", "label": "Pizza", "filter": "pizza"},
            {"emoji": "🍔", "label": "Burgers", "filter": "burgers"},
            {"emoji": "🍜", "label": "Chinese", "filter": "chinese"},
            {"emoji": "🧋", "label": "Drinks", "filter": "drinks"},
        ],
    },
    "trending_tags": [
        "🥞 Masala Dosa",
        "☕ Filter Coffee",
        "🍚 Donne Biryani",
        "🍱 Meals",
    ],
    "restaurants": [],
}

hyderabad = {
    "id": "hyderabad",
    "display_name": "Hyderabad, Telangana",
    "accent_color": "#6A1B9A",
    "accent_light": "#AB47BC",
    "is_pure_veg_market": False,
    "language": {
        "locale": "te-IN + en-IN",
        "script": "Telugu (తెలుగు) + Latin",
        "style": "English-Telugu blend — natural Hyderabad food language",
        "tagline": "హైదరాబాద్ రుచి · Hyderabadi Ruchi · Dil se food",
        "search_placeholder": "Biryani, haleem, dosa, kebabs వెతకండి...",
        "greetings": {
            "morning": {
                "line1": "Good morning! శుభోదయం!",
                "line2": "Irani chai + Osmania? ☀️",
            },
            "afternoon": {
                "line1": "Em chestunnav?",
                "line2": "Biryani time ayyindi! 🍱",
            },
            "evening": {
                "line1": "Sayantram!",
                "line2": "Haleem or kebabs? 🌆",
            },
            "night": {
                "line1": "Late night craving?",
                "line2": "Dum biryani call chestava? 🌙",
            },
        },
        "salary_messages": {
            "premium": "Salary vachindi! Ijjaatha special order cheyyi 💸",
            "normal": "Mid-month — regular Hyderabadi favourites 🍽️",
            "savings": "Month end — deals catch chesko 🤑",
        },
        "local_spotlight": {
            "emoji": "🍚",
            "title": "Dum Biryani Stretch",
            "sub": "Charminar to Madhapur — slow-cook classics",
        },
        "ui_labels": {
            "offers_section": "Offers & Deals",
            "categories_section": "Categories · వర్గాలు",
            "trending_section": "🔥 Trending in Hyd",
            "nearby_section": "Best Near You",
            "filter_btn": "Filter",
            "see_all": "See all →",
            "view_all": "View all",
            "order_btn": "Order →",
            "explore_btn": "Explore",
            "save_btn": "Save",
        },
    },
    "categories": {
        "morning": [
            {"emoji": "🥞", "label": "Dosa", "filter": "dosa"},
            {"emoji": "☕", "label": "Irani Chai", "filter": "irani_chai"},
            {"emoji": "🥯", "label": "Osmania", "filter": "osmania"},
            {"emoji": "🍚", "label": "Idli", "filter": "idli"},
            {"emoji": "🧃", "label": "Juice", "filter": "juice"},
        ],
        "afternoon": [
            {"emoji": "🍚", "label": "Biryani", "filter": "biryani"},
            {"emoji": "🥗", "label": "Thali", "filter": "thali"},
            {"emoji": "🍖", "label": "Haleem", "filter": "haleem"},
            {"emoji": "🌮", "label": "Rolls", "filter": "rolls"},
            {"emoji": "🍛", "label": "Curries", "filter": "curries"},
        ],
        "evening": [
            {"emoji": "🥙", "label": "Kebabs", "filter": "kebabs"},
            {"emoji": "🥜", "label": "Chaat", "filter": "chaat"},
            {"emoji": "☕", "label": "Chai", "filter": "chai"},
            {"emoji": "🍬", "label": "Mithai", "filter": "mithai"},
            {"emoji": "🍧", "label": "Ice Cream", "filter": "ice_cream"},
        ],
        "night": [
            {"emoji": "🍚", "label": "Biryani", "filter": "biryani"},
            {"emoji": "🍖", "label": "Haleem", "filter": "haleem"},
            {"emoji": "🍕", "label": "Pizza", "filter": "pizza"},
            {"emoji": "🍔", "label": "Burgers", "filter": "burgers"},
            {"emoji": "🧋", "label": "Drinks", "filter": "drinks"},
        ],
    },
    "trending_tags": [
        "🍚 Dum Biryani",
        "🍖 Haleem",
        "🥙 Kebabs",
        "☕ Irani Chai",
    ],
    "restaurants": [],
}

src["cities"]["delhi"] = delhi
src["cities"]["bengaluru"] = bengaluru
src["cities"]["hyderabad"] = hyderabad

diwali = src["festival_overlays"]["diwali"]
holi = src["festival_overlays"]["holi"]

festival_overlays = {
    "diwali": {
        "id": "diwali",
        "enabled": True,
        "active": True,
        "city_id": None,
        "start_date": "2026-11-07",
        "end_date": "2026-11-11",
        "priority": 100,
        "detection": "calendar",
        "color_overrides": diwali["color_overrides"],
        "banner": diwali["banner"],
        "categories": diwali["categories"],
        "offer_chips": diwali["offer_chips"],
        "greeting_override": {
            **diwali["greeting_override"],
            "delhi": "Shubh Diwali, Dilli!",
            "bengaluru": "Shubh Deepavali! Namma oorina habba",
            "hyderabad": "Shubh Diwali! Deepavali subhakankshalu",
        },
    },
    "holi": {
        "id": "holi",
        "enabled": True,
        "active": True,
        "city_id": None,
        "start_date": "2026-03-03",
        "end_date": "2026-03-05",
        "priority": 90,
        "detection": "calendar",
        "color_overrides": holi["color_overrides"],
        "banner": holi["banner"],
        "categories": holi["categories"],
        "offer_chips": holi["offer_chips"],
        "greeting_override": {
            **holi["greeting_override"],
            "delhi": "Happy Holi, Dilli!",
            "bengaluru": "Happy Holi! Rangotsava",
            "hyderabad": "Happy Holi! Holi subhakankshalu",
        },
    },
}

payload = {
    "_meta": src["_meta"],
    "resolver": {
        **src["resolver"],
        "priority": ["festival", "salary_cycle", "day_phase", "city_default"],
        "note": (
            "Festival resolved by calendar date + city + priority. "
            "Salary: 1-5 premium, 6-24 normal, 25-31 savings."
        ),
    },
    "cities": src["cities"],
    "day_phases": src["day_phases"],
    "salary_cycles": src["salary_cycles"],
    "festival_overlays": festival_overlays,
}

for cid, city in payload["cities"].items():
    lang = city["language"]
    assert set(lang["greetings"]) == {"morning", "afternoon", "evening", "night"}
    assert set(lang["salary_messages"]) >= {"premium", "normal", "savings"}
    assert lang.get("ui_labels")
    assert lang.get("local_spotlight")
    for phase in ("morning", "afternoon", "evening", "night"):
        assert len(city["categories"][phase]) >= 4
    print(cid, "restaurants=", len(city["restaurants"]))

OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("Wrote", OUT, "bytes=", OUT.stat().st_size)
