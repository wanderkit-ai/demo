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
    "matched_operator": "op_nepal_trek",
    "operator_note": (
        "Himalaya Quest is the strongest fit for an adventure influencer brief. "
        "They can support content stops, permits, guides, and premium teahouses, "
        "but the route cannot support true 4-star hotels outside Kathmandu."
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
    "but not once you are above Lukla and Namche. The best realistic option is a 4-star boutique hotel in "
    "Kathmandu plus premium teahouses on the trail.\n\n"
    "I built a 7-day itinerary around that constraint and optimized it for an adventure travel influencer: "
    "high-viewpoint days, cultural stops, a gear-friendly pace, and a helicopter return that creates a strong closing moment."
)


DEMO_OPERATOR_REPLY = (
    "I found Himalaya Quest Adventures as the best local operator match. They already support Nepal creator treks, "
    "can handle permits and camera gear logistics, and their route quality fits the adventure-luxury positioning.\n\n"
    "Constraint to say clearly in the demo: they cannot provide true 4-star hotels on the trekking route. "
    "They can offer 4-star Kathmandu nights and the best available premium teahouses in the mountains."
)


DEMO_NEGOTIATION_MESSAGES = [
    (
        "agent",
        "Hi Himalaya Quest, sharing a 7-day Nepal creator trek brief for a travel influencer with 250K followers. "
        "They want a premium adventure route, Kathmandu boutique hotel nights, best-available mountain lodges, "
        "permit support, and content-friendly pacing. What is your best all-in rate?",
    ),
    (
        "operator",
        "Namaste! Great to connect. For this trek, we can offer $150/day per person with permits, certified guide, "
        "premium teahouses, meals on the trail, and Kathmandu logistics.",
    ),
    (
        "agent",
        "Thanks. The itinerary is a strong content opportunity and the influencer will tag the operator in the full trip series. "
        "Can you improve the rate by 15-20% and include support for camera gear?",
    ),
    (
        "operator",
        "We can do $130/day. Teahouse costs are fixed, but we can include porter support for camera gear and a monastery visit.",
    ),
    (
        "agent",
        "That is close. If you can reach $120/day and include a helicopter return to reduce fatigue on the final content day, "
        "we can confirm the package and send the final itinerary brief.",
    ),
    (
        "operator",
        "Excellent. $120/day confirmed with certified guide, permits, premium teahouses, camera porter support, and helicopter return. "
        "Kathmandu stays remain 4-star boutique hotels.",
    ),
]


DEMO_DEAL = {
    "price_per_day": 120,
    "inclusions": [
        "Certified trekking guide",
        "Permits and park fees",
        "Premium teahouses on trail",
        "4-star boutique Kathmandu hotel nights",
        "Camera gear porter support",
        "Helicopter return from the trekking route",
    ],
    "summary": "$120/day per person with permits, guide, premium teahouses, Kathmandu boutique hotel nights, camera porter support, and helicopter return.",
    "operator_name": "Himalaya Quest Adventures",
    "operator_id": "op_nepal_trek",
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
    ("Traveler Requirements", "Submit passport copy to Himalaya Quest (valid 6+ months past departure)", "6 weeks before", "Required from both travelers before booking is confirmed.", "high"),
    ("Traveler Requirements", "Send travel insurance certificate covering trekking + helicopter evacuation", "6 weeks before", "Both travelers must provide this before operator confirms.", "high"),
    ("Traveler Requirements", "Submit medical fitness declaration", "6 weeks before", "Self-signed declaration is accepted for this trek grade.", "high"),
    ("Traveler Requirements", "Provide emergency contact name and phone for each traveler", "6 weeks before", "Stored by operator and guide throughout the trek.", "high"),
    ("Traveler Requirements", "Share dietary preferences and any allergies", "4 weeks before", "Operator uses this to brief teahouse cooks on the route.", "medium"),
    ("Traveler Requirements", "Send camera/drone equipment list for customs clearance", "4 weeks before", "Required by Himalaya Quest for content creator add-on.", "medium"),
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
        "operator_id": "op_nepal_trek",
        "operator_name": "Himalaya Quest Adventures",
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


def make_message(sender: str, text: str) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4()),
        "sender": sender,
        "message": text,
        "timestamp": datetime.now().isoformat(),
    }
