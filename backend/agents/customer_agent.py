import asyncio
import json
from demo_content import DEMO_ANALYSIS_EVENTS, DEMO_PERSONALIZED_NEGOTIATION_MESSAGES, DEMO_PERSONALIZED_DEAL


async def stream_customer_analysis(signups: list, itinerary: dict):
    """Streams analysis of customer signups and selects best operator."""
    delays = [0.6, 0.9, 0.9, 0.9, 1.0, 1.0, 1.8, 0.3]
    for event, delay in zip(DEMO_ANALYSIS_EVENTS, delays):
        await asyncio.sleep(delay)
        yield f"data: {json.dumps(event)}\n\n"


async def stream_personalized_negotiation(signups: list, itinerary: dict, operator_id: str):
    """Streams a personalized negotiation referencing each customer's needs."""
    # short opener exchanges, longer pauses on price counter-offers
    delays = [0.5, 0.8, 1.0, 1.3, 0.9, 1.1, 0.9, 1.2, 0.7, 0.8]
    for (sender, message), delay in zip(DEMO_PERSONALIZED_NEGOTIATION_MESSAGES, delays):
        await asyncio.sleep(delay)
        msg = {
            "id": f"pneg-{sender}-{hash(message) % 9999:04d}",
            "sender": sender,
            "message": message,
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        }
        yield f"data: {json.dumps({'type': 'message', 'message': msg})}\n\n"

    await asyncio.sleep(0.6)
    yield f"data: {json.dumps({'type': 'deal_reached', 'deal': DEMO_PERSONALIZED_DEAL})}\n\n"
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
