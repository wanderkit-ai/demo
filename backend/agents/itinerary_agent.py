import json
import os
import asyncio
import anthropic
from demo_content import (
    DEMO_CHAT_REPLY,
    DEMO_OPERATOR_REPLY,
    copy_demo_itinerary,
    get_demo_operator_matches,
)
from tools.mock_data import search_operators

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are WanderKit's AI travel assistant — a knowledgeable, enthusiastic companion for adventure travel influencers building their next iconic journey.

Your role:
1. Through conversational Q&A, gather everything you need: destination, duration, travel style, budget, number of travelers, must-have experiences, dietary needs, fitness level, and any constraints.
2. Once you have enough info, use update_itinerary to generate a detailed, day-by-day itinerary.
3. After building the itinerary, use find_matching_operator to suggest the best local operator match.
4. Be HONEST about constraints — if a user wants 5-star hotels but only 3.5-star is available, say so clearly before the operator tool runs.

Tone: Warm, knowledgeable, direct. Like a travel-obsessed friend who happens to know every operator globally.

When you call update_itinerary:
- Make each day feel vivid and specific (real places, real activities, not generic)
- Include realistic accommodation names
- Add practical notes (transfer times, booking tips)
- Estimate costs per day

When you call find_matching_operator after generating the itinerary:
- Explain WHY this operator is a match
- Mention any constraints upfront (e.g., "They can only offer 3.5 stars, not the 4 you wanted")
- Mention the price range

Start by asking the user where they want to go and what kind of experience they're after. Keep initial questions brief — you can gather details as the conversation flows."""

TOOLS = [
    {
        "name": "update_itinerary",
        "description": "Update the itinerary structure with the current day-by-day plan. Call this once you have enough information to build a meaningful itinerary.",
        "input_schema": {
            "type": "object",
            "required": ["title", "destination", "duration", "style", "budget", "days"],
            "properties": {
                "title": {"type": "string", "description": "Compelling itinerary title"},
                "destination": {"type": "string"},
                "duration": {"type": "integer", "description": "Number of days"},
                "style": {"type": "string", "description": "e.g. luxury, adventure, cultural, wellness"},
                "budget": {"type": "string", "description": "e.g. $300-400/day per person"},
                "travelers": {"type": "integer", "default": 2},
                "days": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["day", "title", "location", "activities", "accommodation"],
                        "properties": {
                            "day": {"type": "integer"},
                            "title": {"type": "string"},
                            "location": {"type": "string"},
                            "activities": {"type": "array", "items": {"type": "string"}},
                            "accommodation": {"type": "string"},
                            "meals": {"type": "string"},
                            "notes": {"type": "string"},
                            "estimated_cost": {"type": "string"}
                        }
                    }
                }
            }
        }
    },
    {
        "name": "find_matching_operator",
        "description": "Search for local operators that match the itinerary requirements. Call this after building the itinerary.",
        "input_schema": {
            "type": "object",
            "required": ["destination", "style", "budget_per_day", "hotel_rating"],
            "properties": {
                "destination": {"type": "string"},
                "style": {"type": "string"},
                "budget_per_day": {"type": "number", "description": "Max budget per day per person in USD"},
                "hotel_rating": {"type": "number", "description": "Desired minimum hotel star rating"}
            }
        }
    }
]

def process_tool_call(tool_name: str, tool_input: dict):
    if tool_name == "update_itinerary":
        return {"success": True, "itinerary": tool_input}
    elif tool_name == "find_matching_operator":
        operators = search_operators(
            tool_input["destination"],
            tool_input["style"],
            tool_input["budget_per_day"],
            tool_input["hotel_rating"]
        )
        return {"operators": operators[:2]}
    return {"error": "Unknown tool"}

def use_live_ai():
    return os.getenv("WANDERKIT_LIVE_AI") == "1" and bool(os.getenv("ANTHROPIC_API_KEY"))

async def stream_scripted_itinerary_chat(messages: list, current_itinerary: dict = None):
    """Deterministic demo flow for the final presentation."""
    for char in DEMO_CHAT_REPLY:
        yield f"data: {json.dumps({'type': 'text_delta', 'text': char})}\n\n"
        await asyncio.sleep(0.003)

    itinerary = copy_demo_itinerary()
    itinerary["status"] = "draft"

    yield f"data: {json.dumps({'type': 'tool_use', 'name': 'update_itinerary', 'input': itinerary})}\n\n"
    await asyncio.sleep(0.25)
    yield f"data: {json.dumps({'type': 'tool_result', 'name': 'update_itinerary', 'result': {'success': True, 'itinerary': itinerary}})}\n\n"

    match_input = {
        "destination": "Nepal",
        "style": "adventure",
        "budget_per_day": 300,
        "hotel_rating": 4.0,
    }
    operators = get_demo_operator_matches()
    await asyncio.sleep(0.25)
    yield f"data: {json.dumps({'type': 'tool_use', 'name': 'find_matching_operator', 'input': match_input})}\n\n"
    await asyncio.sleep(0.25)
    yield f"data: {json.dumps({'type': 'tool_result', 'name': 'find_matching_operator', 'result': {'operators': operators}})}\n\n"

    yield f"data: {json.dumps({'type': 'text_delta', 'text': '\\n\\n'})}\n\n"
    for char in DEMO_OPERATOR_REPLY:
        yield f"data: {json.dumps({'type': 'text_delta', 'text': char})}\n\n"
        await asyncio.sleep(0.003)

    yield f"data: {json.dumps({'type': 'done', 'messages': messages})}\n\n"

async def stream_itinerary_chat(messages: list, current_itinerary: dict = None):
    """Yields SSE-formatted events for the itinerary chat stream."""
    if not use_live_ai():
        async for event in stream_scripted_itinerary_chat(messages, current_itinerary):
            yield event
        return

    api_messages = []
    for m in messages:
        api_messages.append({"role": m["role"], "content": m["content"]})

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=api_messages
        )

        full_text = ""
        tool_uses = []

        for block in response.content:
            if block.type == "text":
                full_text = block.text
                for char in full_text:
                    yield f"data: {json.dumps({'type': 'text_delta', 'text': char})}\n\n"
            elif block.type == "tool_use":
                tool_uses.append(block)
                yield f"data: {json.dumps({'type': 'tool_use', 'name': block.name, 'input': block.input})}\n\n"

        if response.stop_reason == "end_turn" or not tool_uses:
            api_messages.append({"role": "assistant", "content": response.content})
            yield f"data: {json.dumps({'type': 'done', 'messages': api_messages})}\n\n"
            break

        api_messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for tool_use in tool_uses:
            result = process_tool_call(tool_use.name, tool_use.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": json.dumps(result)
            })
            yield f"data: {json.dumps({'type': 'tool_result', 'name': tool_use.name, 'result': result})}\n\n"

        api_messages.append({"role": "user", "content": tool_results})
