import asyncio
import json
import os

try:
    import anthropic as _anthropic
    _client = _anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
except Exception:
    _client = None

LIVE = os.getenv("WANDERKIT_LIVE_AI") and _client

SYSTEM_PROMPT = """You are Noma, a concise but high-signal trip planning agent. A traveler is considering joining a group trip and you need to extract decision-grade preferences for operator planning.

Your goal: run a sharp 3-4 message intake that uncovers:
1. What they're most excited about (adventure, photography, culture, wellness, luxury, etc.)
2. Their experience level with this type of travel
3. Any dietary requirements, physical considerations, or deal-breakers
4. Their single biggest must-have for the trip

Rules:
- Ask ONE clear question per message. Never ask multiple questions at once.
- Keep each response to 2-3 sentences max.
- Sound expert and practical, not fluffy.
- After 3 exchanges (user has replied 3 times), respond warmly and tell them their preferences are saved, then call the save_traveler_profile tool.
- Do not ask for name or email — the frontend collects those separately.

When you have enough to write a useful customer brief, call save_traveler_profile."""

SAVE_TOOL = {
    "name": "save_traveler_profile",
    "description": "Save the traveler's preferences extracted from the conversation.",
    "input_schema": {
        "type": "object",
        "properties": {
            "experience": {
                "type": "string",
                "enum": ["beginner", "intermediate", "advanced"],
                "description": "Their experience level"
            },
            "interests": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Key interests e.g. ['photography', 'cultural', 'wellness']"
            },
            "demands": {
                "type": "string",
                "description": "Specific requirements and must-haves in plain English"
            },
            "chat_summary": {
                "type": "string",
                "description": "1-2 sentence summary for the operator brief"
            }
        },
        "required": ["experience", "interests", "demands", "chat_summary"]
    }
}

# ── Scripted fallback ─────────────────────────────────────────────────────────

SCRIPTED_STEPS = [
    # opener (0 user messages so far)
    "Hi! I’m Noma, your planning agent. I’ll ask three quick questions so the operator can personalize your trip.\n\nFirst: what outcome matters most to you on this trip (adventure, photography, culture, wellness, or luxury comfort)?",
    # after 1st user reply
    "Great context. What’s your experience level for multi-day trekking: beginner, intermediate, or advanced?",
    # after 2nd user reply
    "Perfect. What is your single biggest non-negotiable (for example dietary needs, physical constraints, or a must-have experience) that the operator must guarantee?",
    # after 3rd user reply — closing
    "Excellent — that gives me enough to build a strong traveler brief. I’ve saved your preferences and flagged your non-negotiables for the operator. Add your name and email below to lock your spot and receive your personalized confirmation.",
]

SCRIPTED_PROFILE = {
    "experience": "intermediate",
  "interests": ["adventure", "photography", "cultural"],
  "demands": "Requires one clear must-have to be guaranteed by operator; dietary and physical constraints captured in intake.",
  "chat_summary": "Traveler completed structured intake. Preferences, experience level, and non-negotiables are captured for operator planning.",
}


async def stream_customer_intake(messages: list):
    """Streams agent responses for the customer intake chat."""
    user_count = sum(1 for m in messages if m["role"] == "user")
    is_done = user_count >= 3

    if LIVE and not is_done:
        async for chunk in _stream_live(messages):
            yield chunk
    elif LIVE and is_done:
        async for chunk in _stream_live(messages):
            yield chunk
    else:
        # scripted mode
        step = min(user_count, len(SCRIPTED_STEPS) - 1)
        text = SCRIPTED_STEPS[step]
        words = text.split(" ")
        for i, word in enumerate(words):
            await asyncio.sleep(0.03)
            yield f"data: {json.dumps({'type': 'text_delta', 'text': word + (' ' if i < len(words) - 1 else '')})}\n\n"

        if user_count >= 3:
            await asyncio.sleep(0.4)
            yield f"data: {json.dumps({'type': 'profile_saved', 'profile': SCRIPTED_PROFILE})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'show_form': user_count >= 3})}\n\n"


async def _stream_live(messages: list):
    user_count = sum(1 for m in messages if m["role"] == "user")

    with _client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=300,
        system=SYSTEM_PROMPT,
        tools=[SAVE_TOOL],
        messages=messages,
    ) as stream:
        profile = None
        for event in stream:
            if hasattr(event, "type"):
                if event.type == "content_block_delta" and hasattr(event.delta, "text"):
                    yield f"data: {json.dumps({'type': 'text_delta', 'text': event.delta.text})}\n\n"
                elif event.type == "content_block_start":
                    if hasattr(event.content_block, "type") and event.content_block.type == "tool_use":
                        pass  # tool input streams next
                elif event.type == "content_block_delta" and hasattr(event.delta, "partial_json"):
                    pass

        # check for tool use in final message
        final = stream.get_final_message()
        for block in final.content:
            if block.type == "tool_use" and block.name == "save_traveler_profile":
                profile = block.input

        if profile:
            yield f"data: {json.dumps({'type': 'profile_saved', 'profile': profile})}\n\n"

    yield f"data: {json.dumps({'type': 'done', 'show_form': profile is not None or user_count >= 3})}\n\n"
