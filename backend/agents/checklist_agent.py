import json
import os
import uuid
import anthropic
from demo_content import DEMO_CHECKLIST_ITEMS

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are WanderKit's booking coordinator. Generate a comprehensive pre-trip checklist for a travel itinerary.

Organize items into categories:
- Travel Documents (visas, passports, insurance)
- Flights & Transport (book flights, airport transfers, internal transport)
- Accommodation (confirm all bookings, check-in details)
- Activities & Tours (book in advance, equipment needed)
- Health & Safety (vaccinations, medications, first aid)
- Packing (gear specific to the destination and activities)
- Money & Payments (local currency, cards, operator payments)
- Communication (SIM card, offline maps, emergency contacts)
- Content Creation (camera gear, backup storage, posting schedule)

For each item include: deadline (X weeks before departure), brief notes, and priority (high/medium/low).
Return as a JSON array of checklist items."""

def use_live_ai():
    return os.getenv("WANDERKIT_LIVE_AI") == "1" and bool(os.getenv("ANTHROPIC_API_KEY"))

def generate_checklist(itinerary: dict, deal: dict = None) -> list:
    if not use_live_ai():
        items = []
        for category, task, deadline, notes, priority in DEMO_CHECKLIST_ITEMS:
            items.append({
                "id": str(uuid.uuid4()),
                "category": category,
                "task": task,
                "done": False,
                "deadline": deadline,
                "notes": notes,
                "priority": priority
            })
        return items

    context = f"""
Itinerary: {itinerary.get('title')}
Destination: {itinerary.get('destination')}
Duration: {itinerary.get('duration')} days
Style: {itinerary.get('style')}
Travelers: {itinerary.get('travelers', 2)}
Activities: {', '.join([a for d in itinerary.get('days', []) for a in d.get('activities', [])[:2]][:8])}
"""
    if deal:
        context += f"\nConfirmed operator: {deal.get('operator_name')} at ${deal.get('price_per_day')}/day"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Generate a checklist for this trip:\n{context}\n\nReturn ONLY a JSON array, no prose."
        }]
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    try:
        items_raw = json.loads(text)
    except:
        items_raw = []

    items = []
    for item in items_raw:
        items.append({
            "id": str(uuid.uuid4()),
            "category": item.get("category", "General"),
            "task": item.get("task", ""),
            "done": False,
            "deadline": item.get("deadline", ""),
            "notes": item.get("notes", ""),
            "priority": item.get("priority", "medium")
        })

    return items
