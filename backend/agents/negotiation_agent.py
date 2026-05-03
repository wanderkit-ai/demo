import json
import os
import uuid
import asyncio
from datetime import datetime
import anthropic
from tools.mock_data import get_operator_by_id

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are WanderKit's negotiation agent. You represent travel influencers in negotiations with local tour operators.

Your negotiation strategy:
1. Open with a warm introduction, share the itinerary highlights, and ask for their best package price
2. After getting the initial quote, thank them and ask if they can do 15-20% better given the influencer's reach
3. If they counter, acknowledge the value, push for one more concession (added service, not price)
4. Accept the deal once it's fair or after 2-3 rounds — don't be greedy

Communication style: Professional, friendly, collaborative. Not pushy. Build rapport.

Tools:
- send_telegram: Send a message to the operator
- read_operator_response: Get the operator's latest reply (simulated)
- finalize_deal: Record the agreed terms and close negotiation

Always share specific itinerary details to show you're serious. Mention the influencer's audience reach when relevant."""

TOOLS = [
    {
        "name": "send_telegram",
        "description": "Send a Telegram message to the operator",
        "input_schema": {
            "type": "object",
            "required": ["message"],
            "properties": {
                "message": {"type": "string"}
            }
        }
    },
    {
        "name": "read_operator_response",
        "description": "Read the operator's latest response",
        "input_schema": {
            "type": "object",
            "required": ["round"],
            "properties": {
                "round": {"type": "integer", "description": "Which round of negotiation (1, 2, 3)"}
            }
        }
    },
    {
        "name": "finalize_deal",
        "description": "Record the final deal terms and close the negotiation",
        "input_schema": {
            "type": "object",
            "required": ["price_per_day", "inclusions", "summary"],
            "properties": {
                "price_per_day": {"type": "number"},
                "inclusions": {"type": "array", "items": {"type": "string"}},
                "summary": {"type": "string"}
            }
        }
    }
]

async def run_negotiation(itinerary: dict, operator_id: str):
    """Runs the full negotiation and yields SSE events."""
    operator = get_operator_by_id(operator_id)
    if not operator:
        yield f"data: {json.dumps({'type': 'error', 'message': 'Operator not found'})}\n\n"
        return

    script = operator.get("negotiation_script", {})
    messages_log = []
    negotiation_round = 0
    final_deal = None

    def add_message(sender: str, text: str):
        msg = {
            "id": str(uuid.uuid4()),
            "sender": sender,
            "message": text,
            "timestamp": datetime.now().isoformat()
        }
        messages_log.append(msg)
        return msg

    def get_operator_reply(round_num: int) -> str:
        if round_num == 1:
            return script.get("opening", "Thanks for reaching out! Let me prepare a quote for you.")
        elif round_num == 2:
            return script.get("counter_1", "I can offer a small discount for group bookings.")
        elif round_num == 3:
            return script.get("counter_2", "This is our best final offer.")
        else:
            return script.get("accept", "Deal! Looking forward to working with you.")

    itinerary_summary = f"""
Destination: {itinerary.get('destination', 'TBD')}
Duration: {itinerary.get('duration', 7)} days
Style: {itinerary.get('style', 'adventure')}
Travelers: {itinerary.get('travelers', 2)}
Budget: {itinerary.get('budget', 'flexible')}
"""

    user_prompt = f"""Start a negotiation with operator '{operator['name']}' (Telegram: {operator['telegram_handle']}) for this itinerary:
{itinerary_summary}

Their standard rate is ${operator['price_per_day']}/day per person.
The influencer has 250K followers and will feature the trip extensively.

Run the negotiation: send messages, read responses, and finalize a deal. Aim for 15-20% below their asking price."""

    api_messages = [{"role": "user", "content": user_prompt}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=api_messages
        )

        for block in response.content:
            if block.type == "text" and block.text.strip():
                yield f"data: {json.dumps({'type': 'agent_thinking', 'text': block.text})}\n\n"

        tool_uses = [b for b in response.content if b.type == "tool_use"]

        if response.stop_reason == "end_turn" or not tool_uses:
            api_messages.append({"role": "assistant", "content": response.content})
            yield f"data: {json.dumps({'type': 'done', 'messages': messages_log, 'deal': final_deal})}\n\n"
            break

        api_messages.append({"role": "assistant", "content": response.content})
        tool_results = []

        for tu in tool_uses:
            result = {}

            if tu.name == "send_telegram":
                msg_text = tu.input["message"]
                msg = add_message("agent", msg_text)
                yield f"data: {json.dumps({'type': 'message', 'message': msg})}\n\n"
                result = {"sent": True}
                await asyncio.sleep(0.5)

            elif tu.name == "read_operator_response":
                negotiation_round += 1
                await asyncio.sleep(1)
                reply = get_operator_reply(negotiation_round)
                msg = add_message("operator", reply)
                yield f"data: {json.dumps({'type': 'message', 'message': msg})}\n\n"
                result = {"response": reply, "round": negotiation_round}

            elif tu.name == "finalize_deal":
                final_deal = {
                    "price_per_day": tu.input["price_per_day"],
                    "inclusions": tu.input["inclusions"],
                    "summary": tu.input["summary"],
                    "operator_name": operator["name"],
                    "operator_id": operator_id
                }
                accept_msg = get_operator_reply(4)
                msg = add_message("operator", accept_msg)
                yield f"data: {json.dumps({'type': 'message', 'message': msg})}\n\n"
                yield f"data: {json.dumps({'type': 'deal_reached', 'deal': final_deal})}\n\n"
                result = {"confirmed": True}

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tu.id,
                "content": json.dumps(result)
            })

        api_messages.append({"role": "user", "content": tool_results})
