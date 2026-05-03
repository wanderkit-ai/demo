import json
import os
import anthropic
from tools.mock_data import search_operators, get_operator_by_id

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are WanderKit's operator matching specialist.
Given an itinerary, find and rank the best local operators from our network.

For each operator:
- Explain the match (why this operator fits this specific itinerary)
- Be transparent about any gaps (budget, rating, style mismatches)
- Highlight unique selling points
- Note any constraints honestly

Be concise and helpful. Return a structured analysis."""

TOOLS = [
    {
        "name": "search_operators",
        "description": "Search the operator database for matches",
        "input_schema": {
            "type": "object",
            "required": ["destination", "style", "budget_per_day", "hotel_rating"],
            "properties": {
                "destination": {"type": "string"},
                "style": {"type": "string"},
                "budget_per_day": {"type": "number"},
                "hotel_rating": {"type": "number"}
            }
        }
    },
    {
        "name": "get_operator_details",
        "description": "Get full details about a specific operator",
        "input_schema": {
            "type": "object",
            "required": ["operator_id"],
            "properties": {
                "operator_id": {"type": "string"}
            }
        }
    }
]

def process_tool_call(name: str, input: dict):
    if name == "search_operators":
        return search_operators(input["destination"], input["style"], input["budget_per_day"], input["hotel_rating"])
    elif name == "get_operator_details":
        return get_operator_by_id(input["operator_id"])
    return {}

def match_operators(itinerary: dict) -> dict:
    destination = itinerary.get("destination", "")
    style = itinerary.get("style", "adventure")
    budget = itinerary.get("budget", "$200/day")
    budget_num = 200
    try:
        import re
        nums = re.findall(r'\d+', budget)
        if nums:
            budget_num = int(nums[0])
    except:
        pass

    user_message = f"""Find the best operator matches for this itinerary:
- Destination: {destination}
- Style: {style}
- Budget: {budget} (approx ${budget_num}/day)
- Duration: {itinerary.get('duration', 7)} days
- Travelers: {itinerary.get('travelers', 2)}
- Key activities: {', '.join([d.get('activities', [''])[0] for d in itinerary.get('days', [])[:3]])}

Search and rank the top operators, noting any constraints."""

    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )

        tool_uses = [b for b in response.content if b.type == "tool_use"]
        text_blocks = [b for b in response.content if b.type == "text"]

        if response.stop_reason == "end_turn" or not tool_uses:
            analysis = text_blocks[0].text if text_blocks else ""
            raw_ops = search_operators(destination, style, budget_num, 4.0)
            return {"operators": raw_ops, "analysis": analysis}

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for tu in tool_uses:
            result = process_tool_call(tu.name, tu.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": json.dumps(result)
            })
        messages.append({"role": "user", "content": tool_results})
