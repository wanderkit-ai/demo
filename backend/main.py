import os
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

import store
from models import (
    ChatRequest, OperatorMatchRequest, NegotiateRequest,
    EmailRequest
)
from tools.mock_data import get_all_operators, get_operator_by_id
from agents.itinerary_agent import stream_itinerary_chat
from agents.operator_agent import match_operators
from agents.negotiation_agent import run_negotiation
from agents.checklist_agent import generate_checklist
from demo_content import seed_demo_data

app = FastAPI(title="WanderKit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

seed_demo_data(store)


@app.post("/api/demo/reset")
def reset_demo():
    store.itineraries.clear()
    store.negotiations.clear()
    store.checklists.clear()
    store.conversations.clear()
    seed_demo_data(store)
    return {"success": True}


# ── Itineraries ─────────────────────────────────────────────────────────────

@app.get("/api/itineraries")
def list_itineraries():
    return list(store.itineraries.values())

@app.get("/api/itineraries/{itinerary_id}")
def get_itinerary(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    return it

@app.post("/api/itineraries")
def create_itinerary(body: dict):
    it = {
        "id": str(uuid.uuid4()),
        "title": body.get("title", "Untitled Journey"),
        "destination": body.get("destination", ""),
        "duration": body.get("duration", 7),
        "budget": body.get("budget", ""),
        "style": body.get("style", "adventure"),
        "travelers": body.get("travelers", 2),
        "days": body.get("days", []),
        "status": "draft",
        "matched_operator": None,
        "operator_note": None,
        "created_at": datetime.now().isoformat(),
        "hero_image": ""
    }
    store.save_itinerary(it)
    return it

@app.put("/api/itineraries/{itinerary_id}")
def update_itinerary(itinerary_id: str, body: dict):
    it = store.get_itinerary(itinerary_id)
    if not it:
        it = {"id": itinerary_id, "created_at": datetime.now().isoformat()}
    it.update(body)
    it["id"] = itinerary_id
    store.save_itinerary(it)
    return it

@app.post("/api/itineraries/{itinerary_id}/publish")
def publish_itinerary(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    it["status"] = "published"
    store.save_itinerary(it)
    return it


# ── Chat (streaming) ─────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    current_it = req.current_itinerary

    async def generate():
        async for event in stream_itinerary_chat(messages, current_it):
            yield event

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── Operators ────────────────────────────────────────────────────────────────

@app.get("/api/operators")
def list_operators():
    return get_all_operators()

@app.get("/api/operators/{operator_id}")
def get_operator(operator_id: str):
    op = get_operator_by_id(operator_id)
    if not op:
        raise HTTPException(404, "Operator not found")
    return op

@app.post("/api/operators/match")
def match_operators_route(req: OperatorMatchRequest):
    it = store.get_itinerary(req.itinerary_id)
    if not it:
        it = {
            "destination": req.destination,
            "style": req.style,
            "budget": f"${req.budget_per_day}/day",
            "duration": req.duration,
            "days": []
        }
    result = match_operators(it)
    return result


# ── Negotiations ─────────────────────────────────────────────────────────────

@app.get("/api/negotiations")
def list_negotiations():
    return list(store.negotiations.values())

@app.get("/api/negotiations/{negotiation_id}")
def get_negotiation(negotiation_id: str):
    neg = store.get_negotiation(negotiation_id)
    if not neg:
        raise HTTPException(404, "Negotiation not found")
    return neg

@app.post("/api/negotiations/start")
async def start_negotiation(req: NegotiateRequest):
    it = store.get_itinerary(req.itinerary_id)
    op = get_operator_by_id(req.operator_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    if not op:
        raise HTTPException(404, "Operator not found")

    neg_id = str(uuid.uuid4())
    neg = {
        "id": neg_id,
        "itinerary_id": req.itinerary_id,
        "operator_id": req.operator_id,
        "operator_name": op["name"],
        "status": "active",
        "messages": [],
        "original_price": op["price_per_day"],
        "final_price": None,
        "deal_terms": None,
        "created_at": datetime.now().isoformat()
    }
    store.save_negotiation(neg)

    async def generate():
        deal = None
        all_messages = []
        async for event in run_negotiation(it, req.operator_id):
            yield event
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "message":
                    all_messages.append(data["message"])
                elif data.get("type") == "deal_reached":
                    deal = data["deal"]
            except:
                pass

        neg["messages"] = all_messages
        if deal:
            neg["status"] = "agreed"
            neg["final_price"] = deal.get("price_per_day")
            neg["deal_terms"] = deal.get("summary")
        store.save_negotiation(neg)

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"X-Negotiation-Id": neg_id})


# ── Checklist ────────────────────────────────────────────────────────────────

@app.get("/api/checklist/{itinerary_id}")
def get_checklist(itinerary_id: str):
    c = store.get_checklist(itinerary_id)
    if not c:
        raise HTTPException(404, "Checklist not found")
    return c

@app.post("/api/checklist/generate")
def gen_checklist(body: dict):
    itinerary_id = body.get("itinerary_id")
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")

    neg_id = body.get("negotiation_id")
    deal = None
    if neg_id:
        neg = store.get_negotiation(neg_id)
        if neg and neg.get("status") == "agreed":
            deal = {
                "operator_name": neg["operator_name"],
                "price_per_day": neg["final_price"],
                "summary": neg.get("deal_terms", "")
            }

    items = generate_checklist(it, deal)
    checklist = {
        "id": str(uuid.uuid4()),
        "itinerary_id": itinerary_id,
        "items": items
    }
    store.save_checklist(checklist)
    return checklist

@app.patch("/api/checklist/{itinerary_id}/items/{item_id}")
def update_checklist_item(itinerary_id: str, item_id: str, body: dict):
    c = store.get_checklist(itinerary_id)
    if not c:
        raise HTTPException(404, "Checklist not found")
    for item in c["items"]:
        if item["id"] == item_id:
            item.update(body)
    store.save_checklist(c)
    return c


# ── Email ─────────────────────────────────────────────────────────────────────

@app.post("/api/email/send")
def send_email(req: EmailRequest):
    it = store.get_itinerary(req.itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    # Mock email send
    return {
        "success": True,
        "message": f"Confirmation email sent to {req.user_email}",
        "subject": f"Your WanderKit Trip: {it.get('title', 'Amazing Journey')}",
        "preview": f"Confirmed: {it.get('duration')} days in {it.get('destination')} — your adventure awaits!"
    }
