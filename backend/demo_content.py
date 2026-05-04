import copy
import uuid
from datetime import datetime
from typing import Any

from tools.mock_data import search_operators


DEMO_ITINERARY = {
    "id": "demo-nepal-luxury-creator-trek",
    "title": "7-Day Nepal Creator Trek",
    "destination": "Nepal",
    "duration": 7,
    "budget": "$250-320/day per person",
    "style": "adventure",
    "travelers": 2,
    "status": "published",
    "matched_operator": "access_nepal_tours_trekking",
    "operator_note": (
        "Access Nepal Tours & Trekking is the strongest fit for a luxury adventure influencer brief. "
        "They specialise in EBC luxury treks with deluxe teahouses, Kathmandu boutique hotel nights, "
        "helicopter-supported segments, and private guide logistics. "
        "True 4-star hotels are available in Kathmandu; premium teahouses are the realistic option above Lukla."
    ),
    "created_at": "2026-05-03T09:00:00",
    "hero_image": "",
    "days": [
        {
            "day": 1,
            "title": "Arrival, Brand Brief, and Kathmandu Setup",
            "location": "Kathmandu",
            "activities": [
                "Airport pickup and welcome briefing with local trek lead",
                "Golden-hour content walk through Boudhanath and Thamel",
                "Gear check, permit verification, and shot-list planning",
            ],
            "accommodation": "4-star boutique hotel in Kathmandu",
            "meals": "Welcome dinner",
            "notes": "Best day for sponsored gear setup and intro reels.",
            "estimated_cost": "$290",
        },
        {
            "day": 2,
            "title": "Fly to Lukla and Trek to Phakding",
            "location": "Lukla to Phakding",
            "activities": [
                "Early mountain flight to Lukla",
                "Easy acclimatization trek along the Dudh Koshi river",
                "Operator captures behind-the-scenes arrival content",
            ],
            "accommodation": "Premium teahouse room",
            "meals": "Breakfast, lunch, dinner",
            "notes": "True 4-star hotels are not available after Kathmandu.",
            "estimated_cost": "$240",
        },
        {
            "day": 3,
            "title": "Namche Bazaar Creator Day",
            "location": "Namche Bazaar",
            "activities": [
                "Trek through pine forest and suspension bridges",
                "Arrive in Namche with a guided market walk",
                "Sunset overlook for long-form creator footage",
            ],
            "accommodation": "Best available lodge in Namche",
            "meals": "All meals included",
            "notes": "Operator can arrange porter support for camera equipment.",
            "estimated_cost": "$260",
        },
        {
            "day": 4,
            "title": "Acclimatization and Monastery Visit",
            "location": "Namche and Khumjung",
            "activities": [
                "Short acclimatization hike with Everest viewpoint",
                "Khumjung monastery visit and local guide interview",
                "Afternoon content review and route adjustment",
            ],
            "accommodation": "Best available lodge in Namche",
            "meals": "All meals included",
            "notes": "Good day for cultural content without overloading the trek.",
            "estimated_cost": "$230",
        },
        {
            "day": 5,
            "title": "Tengboche Ridge and Premium Teahouse Stay",
            "location": "Tengboche",
            "activities": [
                "Ridge trek with Himalayan panorama stops",
                "Tengboche monastery visit",
                "Operator coordinates sunrise shoot permissions",
            ],
            "accommodation": "Premium teahouse room",
            "meals": "All meals included",
            "notes": "Comfort is best-in-route, not hotel-star comparable.",
            "estimated_cost": "$250",
        },
        {
            "day": 6,
            "title": "Helicopter Return and Kathmandu Recovery",
            "location": "Tengboche to Kathmandu",
            "activities": [
                "Morning helicopter return to Lukla or Kathmandu, weather permitting",
                "Spa recovery block in Kathmandu",
                "Operator debrief and final content handoff",
            ],
            "accommodation": "4-star boutique hotel in Kathmandu",
            "meals": "Breakfast and farewell dinner",
            "notes": "Helicopter return is the key negotiated upgrade.",
            "estimated_cost": "$520",
        },
        {
            "day": 7,
            "title": "Departure and Final Confirmation",
            "location": "Kathmandu",
            "activities": [
                "Final checklist review",
                "Airport transfer",
                "Confirmation email and operator contact pack sent",
            ],
            "accommodation": "Departure day",
            "meals": "Breakfast",
            "notes": "Use this day to close open sponsor deliverables.",
            "estimated_cost": "$120",
        },
    ],
}


DEMO_CHAT_REPLY = (
    "Yes. I can turn that into a publishable operator brief.\n\n"
    "One important constraint: on this Nepal trekking route, true 4-star hotels are available in Kathmandu, "
    "but not once you are above Lukla and Namche. The best realistic option is a boutique hotel in "
    "Kathmandu plus deluxe teahouses on the trail — which Access Nepal Tours & Trekking specialises in.\n\n"
    "I built a 7-day itinerary around that constraint and optimized it for an adventure travel influencer: "
    "high-viewpoint days, cultural stops, a gear-friendly pace, and a helicopter return that creates a strong closing moment."
)


DEMO_OPERATOR_REPLY = (
    "I found Access Nepal Tours & Trekking as the best local operator match. "
    "They are Nepal's highest-rated luxury trekking operator with a luxury_fit_score of 5/5. "
    "Their EBC Luxury Trek product includes deluxe teahouses, Kathmandu boutique hotel nights, "
    "helicopter-supported segments, and private guide logistics — exactly what this brief needs.\n\n"
    "Constraint to note: true 4-star hotels are only available in Kathmandu. "
    "Above Lukla, Access Nepal offers the best available deluxe teahouses and luxury lodge upgrades on the route."
)


DEMO_NEGOTIATION_MESSAGES = [
    (
        "agent",
        "Hi Access Nepal, sharing a 7-day Nepal creator trek brief for a travel influencer with 250K followers. "
        "They want a luxury adventure route, Kathmandu boutique hotel nights, best-available deluxe teahouses, "
        "permit support, and content-friendly pacing. What is your best all-in rate?",
    ),
    (
        "operator",
        "Namaste! Great to connect. For this trek, we can offer $195/day per person with permits, private certified guide, "
        "deluxe teahouses, all meals on the trail, and Kathmandu boutique hotel logistics.",
    ),
    (
        "agent",
        "Thanks. The itinerary is a strong content opportunity and the influencer will tag Access Nepal in the full trip series. "
        "Can you improve the rate by 15-20% and include support for camera gear?",
    ),
    (
        "operator",
        "We can do $155/day. Teahouse costs are fixed, but we can include a dedicated camera porter and a monastery visit.",
    ),
    (
        "agent",
        "That is close. If you can reach $120/day and include a helicopter return to reduce fatigue on the final content day, "
        "we can confirm the package and send the final itinerary brief.",
    ),
    (
        "operator",
        "Excellent. $120/day confirmed with private guide, permits, deluxe teahouses, camera porter support, and helicopter return. "
        "Kathmandu stays remain boutique hotel nights.",
    ),
]


DEMO_DEAL = {
    "price_per_day": 120,
    "inclusions": [
        "Private certified trekking guide",
        "Permits and park fees",
        "Deluxe teahouses on trail",
        "Kathmandu boutique hotel nights",
        "Camera gear porter support",
        "Helicopter return from the trekking route",
    ],
    "summary": "$120/day per person with permits, private guide, deluxe teahouses, Kathmandu boutique hotel nights, camera porter support, and helicopter return.",
    "operator_name": "Access Nepal Tours & Trekking",
    "operator_id": "access_nepal_tours_trekking",
}

DEMO_OPERATOR_REQUIREMENTS_MESSAGE = (
    "Before we confirm the booking, here is what we need from each traveler:\n\n"
    "**Per traveler (both):**\n"
    "• Passport copy — valid at least 6 months past departure\n"
    "• Travel insurance certificate covering trekking and helicopter evacuation\n"
    "• Medical fitness declaration (self-signed is fine for this grade)\n"
    "• Emergency contact name and phone number\n"
    "• Dietary preferences and any allergies\n\n"
    "**Content creator add-ons:**\n"
    "• Camera and drone equipment list for customs clearance\n"
    "• Drone model and serial number — we handle the permit filing\n\n"
    "Once we receive these, we will send the final booking confirmation within 48 hours."
)

DEMO_TRAVELER_REQUIREMENTS = {
    "per_traveler": [
        "Passport copy (valid 6+ months past departure)",
        "Travel insurance certificate covering trekking + helicopter evacuation",
        "Medical fitness declaration",
        "Emergency contact name and phone number",
        "Dietary preferences and any allergies",
    ],
    "content_creator": [
        "Camera and drone equipment list for customs clearance",
        "Drone model and serial number for permit filing",
    ],
}


DEMO_CHECKLIST_ITEMS = [
    ("Traveler Requirements", "Submit passport copy to Access Nepal (valid 6+ months past departure)", "6 weeks before", "Required from both travelers before booking is confirmed.", "high"),
    ("Traveler Requirements", "Send travel insurance certificate covering trekking + helicopter evacuation", "6 weeks before", "Both travelers must provide this before operator confirms.", "high"),
    ("Traveler Requirements", "Submit medical fitness declaration", "6 weeks before", "Self-signed declaration is accepted for this trek grade.", "high"),
    ("Traveler Requirements", "Provide emergency contact name and phone for each traveler", "6 weeks before", "Stored by operator and guide throughout the trek.", "high"),
    ("Traveler Requirements", "Share dietary preferences and any allergies", "4 weeks before", "Operator uses this to brief teahouse cooks on the route.", "medium"),
    ("Traveler Requirements", "Send camera/drone equipment list for customs clearance", "4 weeks before", "Required by Access Nepal for content creator add-on.", "medium"),
    ("Traveler Requirements", "Provide drone model and serial number for permit filing", "4 weeks before", "Operator handles the filing — just send the model details.", "medium"),
    ("Travel Documents", "Verify passport validity and Nepal visa requirements", "8 weeks before", "Passport should be valid for 6+ months after departure.", "high"),
    ("Travel Documents", "Save permits and operator emergency contacts offline", "2 weeks before", "Keep copies in phone files and cloud storage.", "high"),
    ("Flights & Transport", "Confirm Kathmandu arrival and Lukla weather buffer", "6 weeks before", "Morning flights are more reliable for mountain weather.", "high"),
    ("Accommodation", "Confirm 4-star Kathmandu hotel nights", "3 weeks before", "Mountain nights are premium teahouses, not hotel-star rated.", "medium"),
    ("Activities & Tours", "Lock monastery visit and viewpoint content windows", "2 weeks before", "Operator should confirm local permissions where needed.", "medium"),
    ("Health & Safety", "Schedule altitude medication and insurance review", "4 weeks before", "Insurance must cover trekking and helicopter evacuation.", "high"),
    ("Packing", "Prepare layered trekking kit and rain shell", "2 weeks before", "Avoid overpacking; porter support is for camera gear priority.", "medium"),
    ("Packing", "Pack camera batteries, SSD backup, and weather protection", "1 week before", "Cold weather drains batteries quickly.", "high"),
    ("Money & Payments", "Prepare operator deposit and final payment schedule", "1 week before", "Deal is $120/day per person with negotiated inclusions.", "high"),
    ("Communication", "Install offline maps and buy Nepal eSIM", "1 week before", "Coverage is limited above Namche.", "medium"),
    ("Content Creation", "Finalize shot list for Kathmandu, Namche, and helicopter return", "1 week before", "Prioritize sponsor deliverables early in the route.", "high"),
    ("Content Creation", "Create daily upload and backup routine", "Before departure", "Back up every evening before charging devices.", "medium"),
]


def copy_demo_itinerary() -> dict[str, Any]:
    return copy.deepcopy(DEMO_ITINERARY)


def get_demo_operator_matches() -> list[dict[str, Any]]:
    return search_operators("Nepal", "adventure", 300, 4.0)[:2]


def build_demo_checklist(itinerary_id: str) -> dict[str, Any]:
    return {
        "id": "demo-checklist-nepal",
        "itinerary_id": itinerary_id,
        "items": [
            {
                "id": f"demo-task-{idx + 1}",
                "category": category,
                "task": task,
                "done": False,
                "deadline": deadline,
                "notes": notes,
                "priority": priority,
            }
            for idx, (category, task, deadline, notes, priority) in enumerate(DEMO_CHECKLIST_ITEMS)
        ],
    }


def build_demo_negotiation(itinerary_id: str = "demo-nepal-luxury-creator-trek") -> dict[str, Any]:
    messages = [
        {
            "id": f"demo-neg-msg-{idx + 1}",
            "sender": sender,
            "message": message,
            "timestamp": datetime.now().isoformat(),
        }
        for idx, (sender, message) in enumerate(DEMO_NEGOTIATION_MESSAGES)
    ]
    messages.append({
        "id": "demo-neg-msg-req",
        "sender": "operator",
        "message": DEMO_OPERATOR_REQUIREMENTS_MESSAGE,
        "timestamp": datetime.now().isoformat(),
    })
    return {
        "id": "demo-negotiation-nepal",
        "itinerary_id": itinerary_id,
        "operator_id": "access_nepal_tours_trekking",
        "operator_name": "Access Nepal Tours & Trekking",
        "status": "agreed",
        "messages": messages,
        "original_price": 150,
        "final_price": 120,
        "deal_terms": DEMO_DEAL["summary"],
        "created_at": datetime.now().isoformat(),
    }


def seed_demo_data(store_module: Any) -> None:
    if store_module.itineraries:
        return

    itinerary = copy_demo_itinerary()
    store_module.save_itinerary(itinerary)
    store_module.save_negotiation(build_demo_negotiation(itinerary["id"]))
    store_module.save_checklist(build_demo_checklist(itinerary["id"]))

    # Seed trip pipeline demo data
    for signup in build_demo_trip_signups(itinerary["id"]):
        store_module.add_trip_signup(itinerary["id"], signup)


def make_message(sender: str, text: str) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "sender": sender,
        "message": text,
        "timestamp": datetime.now().isoformat(),
    }


# ── Trip Pipeline Demo Content ────────────────────────────────────────────────

DEMO_TRIP_SIGNUPS = [
    {
        "id": "signup-sarah",
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "experience": "intermediate",
        "interests": ["photography", "adventure", "cultural"],
        "budget_range": "$200–300/day",
        "demands": "Vegan diet required. Golden-hour photography stops must be hard guide commitments. Helicopter return on Day 6 is non-negotiable.",
        "chat_summary": "Primarily here for photography and adventure. Intermediate trekker. Strict vegan — needs to be briefed to every cook. Helicopter return is her hero shot and a deal-breaker if removed.",
        "submitted_at": "2026-05-03T10:15:00",
    },
    {
        "id": "signup-jake",
        "name": "Jake Williams",
        "email": "jake.williams@example.com",
        "experience": "beginner",
        "interests": ["wellness", "luxury", "cultural"],
        "budget_range": "$300+/day",
        "demands": "Morning yoga or meditation setup at every teahouse stop. Best available accommodation. Monastery visits and cultural briefings are the priority.",
        "chat_summary": "First big adventure trip. Wellness and culture are the draw. Needs yoga setup guaranteed at each stop — not best-effort. Pace matters more than distance.",
        "submitted_at": "2026-05-03T11:30:00",
    },
    {
        "id": "signup-priya",
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "experience": "advanced",
        "interests": ["adventure", "cultural", "photography"],
        "budget_range": "$150–200/day",
        "demands": "Authentic local food only — dal bhat and seasonal dishes, no tourist menus. Guide must facilitate real conversations with villagers and monks, not just translate.",
        "chat_summary": "Seasoned trekker, driven by cultural immersion. Wants to eat what locals eat and talk to who locals talk to. Happy to push harder on hiking days for deeper access.",
        "submitted_at": "2026-05-03T12:45:00",
    },
]

DEMO_ANALYSIS_EVENTS = [
    {"type": "thinking", "text": "Reading 3 customer profiles..."},
    {
        "type": "profile",
        "signup_id": "signup-sarah",
        "summary": "Sarah Chen — Photography + Adventure, vegan diet required, helicopter return essential",
    },
    {
        "type": "profile",
        "signup_id": "signup-jake",
        "summary": "Jake Williams — Wellness + Luxury, beginner trekker, morning yoga, cultural priority",
    },
    {
        "type": "profile",
        "signup_id": "signup-priya",
        "summary": "Priya Patel — Advanced trekker, authentic local food, cultural immersion, guide-facilitated interactions",
    },
    {"type": "thinking", "text": "Cross-referencing 12 operators against combined requirements..."},
    {"type": "thinking", "text": "Scoring on: dietary flexibility, photography logistics, wellness setup, cultural depth, helicopter access..."},
    {
        "type": "operator_selected",
        "operator_id": "access_nepal_tours_trekking",
        "operator_name": "Access Nepal Tours & Trekking",
        "score": 94,
        "reasoning": (
            "Access Nepal Tours & Trekking scores 94/100 across all three profiles. "
            "Their kitchen staff can prepare vegan meals from Kathmandu through Tengboche. "
            "The lead guide doubles as a photography expedition assistant with dedicated content stop protocols. "
            "Yoga mats are available at all partner teahouses on the route. "
            "Monastery access and cultural briefings are built into their standard luxury itinerary. "
            "Helicopter return is a confirmed inclusion on their EBC Luxury Trek product. "
            "They hold a luxury_fit_score of 5/5 — the highest in the operator database. "
            "No other operator covers this combination of luxury, photography logistics, and cultural depth."
        ),
    },
    {"type": "done"},
]

DEMO_PERSONALIZED_NEGOTIATION_MESSAGES = [
    (
        "agent",
        "Hey! Got a confirmed group of 3 for the Nepal trek. They all went through our intake — each has specific needs. Can I share their profiles before we talk price?",
    ),
    (
        "operator",
        "Hey, yes please! Send them over 👋",
    ),
    (
        "agent",
        "Here's what each person needs:\n\n"
        "• Sarah — strict vegan (every meal, whole route), photography stops locked into the guide brief, helicopter return Day 6 is a hard requirement\n"
        "• Jake — morning yoga setup guaranteed at every teahouse, best available rooms, cultural pacing (first big trip)\n"
        "• Priya — local food only, no tourist menu. Guide needs to actually talk to locals with her, not just translate\n\n"
        "What's your all-in rate for a custom package covering all three?",
    ),
    (
        "operator",
        "We can do all of this 👌 Vegan meals yes, yoga mats at our teahouses yes, helicopter return yes. Pasang (our senior guide) is exactly who Priya needs — 12 years on this route, speaks Sherpa fluently.\n\nFor a fully customised group of 3 with these inclusions — $195/person/day.",
    ),
    (
        "agent",
        "$195 is way over budget for this group. These travellers have 250K combined social reach and the operator gets tagged across the full content series. What's the real number?",
    ),
    (
        "operator",
        "Appreciate the reach, genuinely. Best I can hold quality at is $155/day. That keeps helicopter return, all three personal inclusions, and Pasang as lead guide.",
    ),
    (
        "agent",
        "$155 still doesn't work. Group budget is $115-120 max. If we can land there, I'll send the traveller briefs today and we move fast.",
    ),
    (
        "operator",
        "$120 is tight but — confirmed group of 3, social tagging in the agreement, we move this week?\n\n$120/day. Everything included. Deal.",
    ),
    (
        "agent",
        "Deal. $120/day, all three profiles covered, tagging confirmed. Sending Sarah, Jake and Priya's full briefs now 🤝",
    ),
    (
        "operator",
        "Let's go! Personal packs ready for all three once we get the briefs. Looking forward to this one 🏔️",
    ),
]

DEMO_PERSONALIZED_DEAL = {
    "price_per_day": 120,
    "inclusions": [
        "Vegan meals whole route (Sarah)",
        "Photography stops locked in guide brief (Sarah)",
        "Yoga setup guaranteed at every teahouse (Jake)",
        "Local food only — dal bhat & seasonal (Priya)",
        "Guide facilitates real local conversations (Priya)",
        "Helicopter return — Day 6",
        "Camera porter support",
        "Pasang as lead guide (12 yrs on route)",
        "All permits & park fees",
    ],
    "summary": (
        "$120/day per person — down from $195. "
        "All 3 profiles covered: vegan meals, photography stops, yoga, local food, helicopter return."
    ),
    "operator_name": "Access Nepal Tours & Trekking",
    "operator_id": "access_nepal_tours_trekking",
}

DEMO_TRAVELER_EMAILS = {
    "signup-sarah": {
        "to": "sarah.chen@example.com",
        "subject": "Your Nepal Trek is Confirmed, Sarah — Itinerary + Personal Pack",
        "preview": "Vegan meals, golden-hour photo stops, and helicopter return confirmed for your 7-day Nepal creator trek.",
        "personalized_note": (
            "Your vegan menu is confirmed from Kathmandu through Tengboche — briefed to every cook on the route. "
            "Photography stops are hard commitments in Pasang's daily brief. "
            "Helicopter return is locked for Day 6. Your personal camera porter brief is attached."
        ),
    },
    "signup-jake": {
        "to": "jake.williams@example.com",
        "subject": "Your Nepal Trek is Confirmed, Jake — Wellness + Cultural Pack",
        "preview": "Morning yoga setup, monastery access, and best-available accommodation confirmed for your 7-day Nepal trek.",
        "personalized_note": (
            "Yoga mats are guaranteed at all four teahouse stages — a wellness schedule is attached. "
            "Monastery access and cultural briefings are built into Days 4 and 5. "
            "Pasang will pace the group around your experience level — no pressure to rush."
        ),
    },
    "signup-priya": {
        "to": "priya.patel@example.com",
        "subject": "Your Nepal Trek is Confirmed, Priya — Local + Cultural Access Pack",
        "preview": "Local food, guide-facilitated village conversations, and cultural depth confirmed for your 7-day Nepal trek.",
        "personalized_note": (
            "Every teahouse on the route has been briefed: local dal bhat and seasonal dishes for your portion. "
            "Pasang's village contacts at Khumjung are pre-arranged for Day 4. "
            "Cultural access notes and a brief on the monastery visit are attached."
        ),
    },
}


def build_demo_trip_signups(itinerary_id: str) -> list[dict[str, Any]]:
    import copy
    signups = copy.deepcopy(DEMO_TRIP_SIGNUPS)
    return signups


def build_demo_personalized_negotiation(itinerary_id: str) -> dict[str, Any]:
    messages = [
        {
            "id": f"trip-neg-msg-{idx + 1}",
            "sender": sender,
            "message": message,
            "timestamp": datetime.now().isoformat(),
        }
        for idx, (sender, message) in enumerate(DEMO_PERSONALIZED_NEGOTIATION_MESSAGES)
    ]
    return {
        "itinerary_id": itinerary_id,
        "operator_id": "access_nepal_tours_trekking",
        "operator_name": "Access Nepal Tours & Trekking",
        "status": "agreed",
        "messages": messages,
        "original_price": 195,
        "final_price": 120,
        "deal_terms": DEMO_PERSONALIZED_DEAL["summary"],
        "deal": DEMO_PERSONALIZED_DEAL,
        "created_at": datetime.now().isoformat(),
    }
