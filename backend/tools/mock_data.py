OPERATORS = [
    {
        "id": "op_nepal_trek",
        "name": "Himalaya Quest Adventures",
        "destinations": ["Nepal", "Tibet", "Bhutan"],
        "styles": ["adventure", "trekking", "cultural"],
        "hotel_rating": 3.0,
        "price_per_day": 150,
        "location": "Kathmandu, Nepal",
        "verified": True,
        "featured": True,
        "rating": 4.9,
        "reviews": 312,
        "bookings": 847,
        "specialties": ["Everest Base Camp", "Annapurna Circuit", "helicopter tours", "teahouse treks", "mountain photography"],
        "description": "Nepal's most trusted trekking operator. 15 years of experience on the world's highest peaks. Safety-first approach with certified guides and well-maintained equipment.",
        "telegram_handle": "@himalaya_quest",
        "image_color": "bg-emerald-100",
        "packages": [
            {
                "id": "pkg_nepal_1",
                "name": "Everest Base Camp Classic Trek",
                "duration": 14,
                "price_per_day": 120,
                "total_price": 1680,
                "difficulty": "Strenuous",
                "max_group": 12,
                "type": "Group",
                "refundable": True,
                "deposit_required": True,
                "featured": True,
                "includes": ["Certified Guide", "Teahouse Accommodation", "All Meals", "Permits & Fees", "Emergency Insurance"],
                "excludes": ["International Flights", "Personal Gear", "Tips"],
                "cancellation_policy": "Fully refundable until 30 days before departure",
                "daily_breakdown": [
                    {"label": "Days 1–4 (Kathmandu & Acclimatization)", "price": 90},
                    {"label": "Days 5–10 (Trek to EBC)", "price": 130},
                    {"label": "Days 11–14 (Return & Debrief)", "price": 110},
                ],
                "taxes_fees": 201.60,
                "discount_label": "10% off for groups 8+"
            },
            {
                "id": "pkg_nepal_2",
                "name": "Annapurna Circuit — Private",
                "duration": 10,
                "price_per_day": 185,
                "total_price": 1850,
                "difficulty": "Moderate",
                "max_group": 4,
                "type": "Private",
                "refundable": False,
                "deposit_required": True,
                "featured": False,
                "includes": ["Private Guide", "Boutique Lodges", "All Meals", "Permits", "Porter"],
                "excludes": ["Flights", "Personal Insurance", "Tips"],
                "cancellation_policy": "Non-refundable after booking",
                "daily_breakdown": [
                    {"label": "Days 1–3 (Pokhara & entry)", "price": 160},
                    {"label": "Days 4–7 (High passes)", "price": 200},
                    {"label": "Days 8–10 (Descent & exit)", "price": 170},
                ],
                "taxes_fees": 222.00,
                "discount_label": ""
            },
            {
                "id": "pkg_nepal_3",
                "name": "Langtang Valley Short Trek",
                "duration": 7,
                "price_per_day": 95,
                "total_price": 665,
                "difficulty": "Easy",
                "max_group": 16,
                "type": "Group",
                "refundable": True,
                "deposit_required": False,
                "featured": False,
                "includes": ["Guide", "Teahouse Lodging", "Breakfast & Dinner", "Permits"],
                "excludes": ["Flights", "Gear", "Lunch"],
                "cancellation_policy": "Fully refundable until 14 days before departure",
                "daily_breakdown": [
                    {"label": "Days 1–2 (Kathmandu)", "price": 80},
                    {"label": "Days 3–6 (Langtang Valley)", "price": 100},
                    {"label": "Day 7 (Return)", "price": 80},
                ],
                "taxes_fees": 79.80,
                "discount_label": ""
            }
        ],
        "negotiation_script": {
            "opening": "Namaste! Great to connect. For the trek you've described, we'd offer $150/day per person — teahouse lodging, all meals, permits, and certified guides.",
            "counter_1": "We can do $130/day but honestly the teahouses are fixed cost. What I can add is a yak caravan experience and a visit to a high-altitude monastery.",
            "counter_2": "Okay, $120/day is our limit. I'll also upgrade your base camp arrival to a helicopter return to Lukla instead of the 8-hour walk back.",
            "accept": "Excellent! $120/day with helicopter return. Permits and equipment included. This will be the trek of a lifetime!"
        }
    },
    {
        "id": "op_patagonia",
        "name": "Wild Patagonia Expeditions",
        "destinations": ["Patagonia", "Chile", "Argentina", "Torres del Paine"],
        "styles": ["adventure", "trekking", "wildlife"],
        "hotel_rating": 3.5,
        "price_per_day": 210,
        "location": "Puerto Natales, Chile",
        "verified": True,
        "featured": True,
        "rating": 4.8,
        "reviews": 198,
        "bookings": 430,
        "specialties": ["Torres del Paine W-Circuit", "Glacier hikes", "Condor watching", "Puma tracking", "Wild camping"],
        "description": "The definitive Patagonia trekking company. We operate the only fully carbon-neutral expedition circuit in Patagonia with expert naturalist guides.",
        "telegram_handle": "@wild_patagonia",
        "image_color": "bg-sky-100",
        "packages": [
            {
                "id": "pkg_pat_1",
                "name": "Torres del Paine W-Circuit",
                "duration": 5,
                "price_per_day": 195,
                "total_price": 975,
                "difficulty": "Moderate",
                "max_group": 10,
                "type": "Group",
                "refundable": True,
                "deposit_required": True,
                "featured": True,
                "includes": ["Bilingual Guide", "Refugio Accommodation", "All Meals", "Park Entry", "Ferry transfers"],
                "excludes": ["International Flights", "Sleeping bag rental", "Tips"],
                "cancellation_policy": "Fully refundable until 21 days before departure",
                "daily_breakdown": [
                    {"label": "Day 1 (Torres Base)", "price": 180},
                    {"label": "Days 2–3 (Valle del Francés)", "price": 200},
                    {"label": "Days 4–5 (Grey Glacier)", "price": 195},
                ],
                "taxes_fees": 117.00,
                "discount_label": "Preferred Operator"
            },
            {
                "id": "pkg_pat_2",
                "name": "Glacier Ice Trekking — Day Tour",
                "duration": 1,
                "price_per_day": 280,
                "total_price": 280,
                "difficulty": "Moderate",
                "max_group": 8,
                "type": "Private",
                "refundable": True,
                "deposit_required": False,
                "featured": False,
                "includes": ["Expert Ice Guide", "Crampons & Ice Axe", "Safety Equipment", "Hot Lunch on Glacier", "Boat Transfer"],
                "excludes": ["Hotel pickup", "Personal gear"],
                "cancellation_policy": "Refundable until 48 hours before departure",
                "daily_breakdown": [
                    {"label": "Full day glacier trek", "price": 280},
                ],
                "taxes_fees": 33.60,
                "discount_label": ""
            },
            {
                "id": "pkg_pat_3",
                "name": "O-Circuit Full Loop — Expedition",
                "duration": 9,
                "price_per_day": 230,
                "total_price": 2070,
                "difficulty": "Strenuous",
                "max_group": 6,
                "type": "Group",
                "refundable": False,
                "deposit_required": True,
                "featured": False,
                "includes": ["Lead Guide + Assistant", "Wild Camping Gear", "All Meals", "Park Permits", "Kayak segment"],
                "excludes": ["Flights to Punta Arenas", "Personal gear"],
                "cancellation_policy": "Non-refundable — expedition logistics committed 30 days out",
                "daily_breakdown": [
                    {"label": "Days 1–3 (W-sector)", "price": 200},
                    {"label": "Days 4–6 (Back circuit, remote)", "price": 260},
                    {"label": "Days 7–9 (Kayak & exit)", "price": 220},
                ],
                "taxes_fees": 248.40,
                "discount_label": ""
            }
        ],
        "negotiation_script": {
            "opening": "Hola! Great itinerary. Our Patagonia circuit runs $210/day — refugio stays, guides, meals, park fees included. The W-Circuit alone is worth it.",
            "counter_1": "For media/influencer trips we can do $185/day. We'd love to co-promote on your channels. Adding a puma-tracking morning session.",
            "counter_2": "Final price: $170/day. Adding a private condor watching sunrise hike. Cannot go lower.",
            "accept": "Trato hecho! $170/day confirmed. Patagonia will blow your audience away!"
        }
    },
    {
        "id": "op_morocco_atlas",
        "name": "Atlas Mountain Guides",
        "destinations": ["Morocco", "Atlas Mountains", "Sahara Desert", "Toubkal"],
        "styles": ["adventure", "cultural", "trekking"],
        "hotel_rating": 3.5,
        "price_per_day": 140,
        "location": "Imlil, Morocco",
        "verified": True,
        "featured": False,
        "rating": 4.7,
        "reviews": 156,
        "bookings": 290,
        "specialties": ["Toubkal Summit", "Sahara Desert crossing", "Berber village treks", "Atlas traverse", "Mule-supported expeditions"],
        "description": "Morocco's premier mountain guiding company, run by certified Berber guides. We offer authentic cultural immersion alongside world-class trekking.",
        "telegram_handle": "@atlas_guides",
        "image_color": "bg-amber-100",
        "packages": [
            {
                "id": "pkg_mor_1",
                "name": "Toubkal Summit — 3 Days",
                "duration": 3,
                "price_per_day": 140,
                "total_price": 420,
                "difficulty": "Strenuous",
                "max_group": 8,
                "type": "Group",
                "refundable": True,
                "deposit_required": False,
                "featured": True,
                "includes": ["Certified Berber Guide", "Mountain Refuge Nights", "Meals", "Mule Support", "Summit Certificate"],
                "excludes": ["Transport to Imlil", "Personal gear"],
                "cancellation_policy": "Fully refundable until 7 days before",
                "daily_breakdown": [
                    {"label": "Day 1 (Imlil to Refuge)", "price": 130},
                    {"label": "Day 2 (Summit & Return to Refuge)", "price": 155},
                    {"label": "Day 3 (Descent)", "price": 130},
                ],
                "taxes_fees": 50.40,
                "discount_label": ""
            },
            {
                "id": "pkg_mor_2",
                "name": "Sahara Desert Crossing — 6 Days",
                "duration": 6,
                "price_per_day": 165,
                "total_price": 990,
                "difficulty": "Moderate",
                "max_group": 10,
                "type": "Group",
                "refundable": True,
                "deposit_required": True,
                "featured": False,
                "includes": ["Guide + Camel Handler", "Desert Camp Nights", "All Meals", "Camel Trek", "4x4 Transfers"],
                "excludes": ["Flights to Marrakech", "Personal gear"],
                "cancellation_policy": "Refundable until 14 days before departure",
                "daily_breakdown": [
                    {"label": "Days 1–2 (Atlas to Sahara)", "price": 145},
                    {"label": "Days 3–4 (Desert crossing)", "price": 180},
                    {"label": "Days 5–6 (Return circuit)", "price": 160},
                ],
                "taxes_fees": 118.80,
                "discount_label": ""
            }
        ],
        "negotiation_script": {
            "opening": "Marhaba! Your Morocco trek itinerary looks excellent. We offer $140/day — mountain guides, accommodation, meals, and permits included.",
            "counter_1": "For group bookings we can offer $125/day. Adding a night with a Berber family and traditional hammam experience.",
            "counter_2": "Final offer: $115/day. Including a private cooking class in a traditional Moroccan kitchen.",
            "accept": "Shukran! $115/day confirmed. Your clients will have an unforgettable Atlas experience!"
        }
    },
    {
        "id": "op_peru_inca",
        "name": "Inca Trail Specialists",
        "destinations": ["Peru", "Cusco", "Machu Picchu", "Sacred Valley", "Salkantay"],
        "styles": ["adventure", "cultural", "trekking"],
        "hotel_rating": 3.5,
        "price_per_day": 175,
        "location": "Cusco, Peru",
        "verified": True,
        "featured": False,
        "rating": 4.9,
        "reviews": 421,
        "bookings": 1204,
        "specialties": ["Classic Inca Trail", "Salkantay Trek", "Choquequirao", "Jungle route", "Private expeditions"],
        "description": "Peru's most decorated trekking company with 20+ years on the Inca Trail. We hold the highest quota of Classic Inca Trail permits and guarantee Sun Gate arrival at dawn.",
        "telegram_handle": "@inca_specialists",
        "image_color": "bg-yellow-100",
        "packages": [
            {
                "id": "pkg_peru_1",
                "name": "Classic Inca Trail — 4 Days",
                "duration": 4,
                "price_per_day": 175,
                "total_price": 700,
                "difficulty": "Moderate",
                "max_group": 16,
                "type": "Group",
                "refundable": True,
                "deposit_required": True,
                "featured": True,
                "includes": ["Licensed Guide", "Porters", "All Meals (5-star camp food)", "Permits", "Camping Gear", "First Aid"],
                "excludes": ["Flights to Cusco", "Sleeping bag", "Tips"],
                "cancellation_policy": "Refundable until 60 days before (permits non-refundable after issue)",
                "daily_breakdown": [
                    {"label": "Day 1 (KM 82 – Wayllabamba)", "price": 160},
                    {"label": "Day 2 (Dead Woman's Pass)", "price": 190},
                    {"label": "Day 3 (Wiñay Wayna)", "price": 175},
                    {"label": "Day 4 (Sun Gate & Machu Picchu)", "price": 165},
                ],
                "taxes_fees": 84.00,
                "discount_label": "Booked 1,204x"
            },
            {
                "id": "pkg_peru_2",
                "name": "Salkantay Trek — 5 Days",
                "duration": 5,
                "price_per_day": 145,
                "total_price": 725,
                "difficulty": "Strenuous",
                "max_group": 12,
                "type": "Group",
                "refundable": True,
                "deposit_required": False,
                "featured": False,
                "includes": ["Guide", "Horses for gear", "Dome tents", "All Meals", "Train return from Aguas Calientes"],
                "excludes": ["Cusco accommodation", "Personal gear"],
                "cancellation_policy": "Fully refundable until 21 days before departure",
                "daily_breakdown": [
                    {"label": "Days 1–2 (Salkantay Pass)", "price": 155},
                    {"label": "Days 3–4 (Cloud forest descent)", "price": 140},
                    {"label": "Day 5 (Machu Picchu)", "price": 135},
                ],
                "taxes_fees": 87.00,
                "discount_label": ""
            }
        ],
        "negotiation_script": {
            "opening": "Hola! The Classic Inca Trail is $175/day all-inclusive. We have limited permits so dates fill up 6+ months in advance — worth securing quickly.",
            "counter_1": "For influencer partnerships: $155/day. We'd love content from the Sun Gate sunrise. Adding a private Machu Picchu sunrise entry.",
            "counter_2": "My best: $145/day with private guide upgrade. Permits are our biggest cost — truly cannot go lower.",
            "accept": "Perfecto! $145/day with private guide confirmed. The Inca Trail will be extraordinary for your content!"
        }
    },
    {
        "id": "op_kenya_safari",
        "name": "Savanna Dreams Kenya",
        "destinations": ["Kenya", "Tanzania", "Rwanda"],
        "styles": ["adventure", "luxury", "wildlife"],
        "hotel_rating": 4.5,
        "price_per_day": 650,
        "location": "Nairobi, Kenya",
        "verified": True,
        "featured": True,
        "rating": 4.9,
        "reviews": 267,
        "bookings": 589,
        "specialties": ["Big Five safari", "hot air balloon", "Maasai village", "mountain gorilla trekking", "walking safaris"],
        "description": "East Africa's most exclusive safari & walking operator. Private conservancies, luxury tented camps, and once-in-a-lifetime wildlife encounters.",
        "telegram_handle": "@savanna_dreams",
        "image_color": "bg-orange-100",
        "packages": [
            {
                "id": "pkg_kenya_1",
                "name": "Maasai Mara Walking Safari — 4 Days",
                "duration": 4,
                "price_per_day": 580,
                "total_price": 2320,
                "difficulty": "Easy",
                "max_group": 6,
                "type": "Private",
                "refundable": True,
                "deposit_required": True,
                "featured": True,
                "includes": ["Expert Naturalist Guide", "Luxury Tented Camp", "All Meals & Safari Drinks", "Game Drives", "Walking Safaris", "Maasai Village Visit"],
                "excludes": ["International Flights", "Visas", "Tips"],
                "cancellation_policy": "Fully refundable until 45 days before departure",
                "daily_breakdown": [
                    {"label": "Day 1 (Mara arrival & evening drive)", "price": 520},
                    {"label": "Days 2–3 (Full day game drives + walks)", "price": 610},
                    {"label": "Day 4 (Morning walk & departure)", "price": 490},
                ],
                "taxes_fees": 278.40,
                "discount_label": "Preferred Partner"
            },
            {
                "id": "pkg_kenya_2",
                "name": "Mt Kenya Trekking — Point Lenana",
                "duration": 5,
                "price_per_day": 290,
                "total_price": 1450,
                "difficulty": "Strenuous",
                "max_group": 8,
                "type": "Group",
                "refundable": True,
                "deposit_required": True,
                "featured": False,
                "includes": ["Certified Guide", "Mountain Huts", "All Meals", "Park Fees", "Porters", "Emergency O2"],
                "excludes": ["Nairobi transfers", "Personal gear"],
                "cancellation_policy": "Refundable until 14 days before departure",
                "daily_breakdown": [
                    {"label": "Days 1–2 (Acclimatization hikes)", "price": 260},
                    {"label": "Day 3 (Summit push — Point Lenana 4,985m)", "price": 340},
                    {"label": "Days 4–5 (Descent & Nairobi return)", "price": 275},
                ],
                "taxes_fees": 174.00,
                "discount_label": ""
            }
        ],
        "negotiation_script": {
            "opening": "Jambo! Our all-inclusive safari/trekking experience is $650/day — luxury camps, expert naturalist guides, all meals and park fees included.",
            "counter_1": "For media/influencer trips we can do $580/day. We'd like to co-promote on your channels. We'll add a hot air balloon ride over the Mara.",
            "counter_2": "Absolute minimum: $540/day. Adding a gorilla trekking permit in Rwanda (normally $1,500 each).",
            "accept": "Asante sana! $540/day with gorilla permits included. Your audience will be blown away!"
        }
    }
]

def get_all_operators():
    return OPERATORS

def get_operator_by_id(op_id: str):
    for op in OPERATORS:
        if op["id"] == op_id:
            return op
    return None

def search_operators(destination: str, style: str, budget_per_day: float, hotel_rating: float):
    results = []
    dest_lower = destination.lower()
    style_lower = style.lower()

    for op in OPERATORS:
        score = 0
        dest_match = any(dest_lower in d.lower() or d.lower() in dest_lower for d in op["destinations"])
        if dest_match:
            score += 40
        style_match = any(style_lower in s.lower() or s.lower() in style_lower for s in op["styles"])
        if style_match:
            score += 30
        if op["price_per_day"] <= budget_per_day * 1.2:
            score += 20
        elif op["price_per_day"] <= budget_per_day * 1.5:
            score += 10
        rating_diff = abs(op["hotel_rating"] - hotel_rating)
        if rating_diff <= 0.5:
            score += 10
        elif rating_diff <= 1:
            score += 5

        if score > 0:
            op_copy = op.copy()
            op_copy["match_score"] = score
            if op["hotel_rating"] < hotel_rating:
                op_copy["constraint_note"] = f"Note: We can only offer {op['hotel_rating']}-star accommodation, not the {hotel_rating}-star you requested."
            elif op["price_per_day"] > budget_per_day:
                op_copy["constraint_note"] = f"Note: Standard rate ${op['price_per_day']}/day exceeds your ${int(budget_per_day)}/day budget. Negotiation possible."
            results.append(op_copy)

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:4]
