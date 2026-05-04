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
from agents.customer_agent import stream_customer_analysis, stream_personalized_negotiation
from agents.customer_intake_agent import stream_customer_intake
from demo_content import seed_demo_data, DEMO_ANALYSIS_EVENTS, DEMO_TRAVELER_EMAILS, build_demo_trip_signups
from models import TripSignupRequest

app = FastAPI(title="Noma API")

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
    store.trip_signups.clear()
    store.trip_analyses.clear()
    store.trip_negotiations.clear()
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
    deduped = {}
    for neg in store.negotiations.values():
        key = f"{neg.get('itinerary_id')}::{neg.get('operator_id')}"
        prev = deduped.get(key)
        if not prev:
            deduped[key] = neg
            continue
        prev_ts = prev.get("created_at", "")
        curr_ts = neg.get("created_at", "")
        if curr_ts >= prev_ts:
            deduped[key] = neg
    return list(deduped.values())

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

    existing_neg = next(
        (
            n for n in store.negotiations.values()
            if n.get("itinerary_id") == req.itinerary_id and n.get("operator_id") == req.operator_id
        ),
        None
    )

    neg_id = existing_neg["id"] if existing_neg else str(uuid.uuid4())
    neg = existing_neg or {
        "id": neg_id,
        "itinerary_id": req.itinerary_id,
        "operator_id": req.operator_id,
        "operator_name": op["name"],
        "created_at": datetime.now().isoformat()
    }
    neg.update({
        "status": "active",
        "messages": [],
        "original_price": op["price_per_day"],
        "final_price": None,
        "deal_terms": None,
    })
    store.save_negotiation(neg)

    # Hard-enforce one negotiation per itinerary+operator pair in memory
    duplicate_ids = [
        n_id for n_id, n in store.negotiations.items()
        if n_id != neg_id
        and n.get("itinerary_id") == req.itinerary_id
        and n.get("operator_id") == req.operator_id
    ]
    for dup_id in duplicate_ids:
        store.negotiations.pop(dup_id, None)

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
    return {
        "success": True,
        "message": f"Confirmation email sent to {req.user_email}",
        "subject": f"Your Noma Trip: {it.get('title', 'Amazing Journey')}",
        "preview": f"Confirmed: {it.get('duration')} days in {it.get('destination')} — your adventure awaits!"
    }


# ── Trip Pipeline ─────────────────────────────────────────────────────────────

@app.post("/api/trips/{itinerary_id}/launch")
def launch_trip(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    it["trip_launched"] = True
    store.save_itinerary(it)
    # Auto-seed demo customers for any newly launched trip (demo mode)
    if not store.get_trip_signups(itinerary_id):
        for signup in build_demo_trip_signups(itinerary_id):
            store.add_trip_signup(itinerary_id, signup)
    return {"success": True, "itinerary_id": itinerary_id}


@app.post("/api/trips/{itinerary_id}/customer-chat")
async def customer_chat(itinerary_id: str, body: dict):
    messages = body.get("messages", [])

    async def generate():
        profile = None
        async for event in stream_customer_intake(messages):
            yield event
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "profile_saved":
                    profile = data["profile"]
            except:
                pass
        # Profile is saved when the frontend calls /signup after chat
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/api/trips/{itinerary_id}")
def get_trip(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    signups = store.get_trip_signups(itinerary_id)
    analysis = store.get_trip_analysis(itinerary_id)
    neg = store.get_trip_negotiation(itinerary_id)
    return {
        "itinerary": it,
        "signup_count": len(signups),
        "trip_launched": it.get("trip_launched", False),
        "analysis": analysis,
        "negotiation": neg,
    }

@app.post("/api/trips/{itinerary_id}/signup")
def trip_signup(itinerary_id: str, body: dict):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Trip not found")
    signup = {
        "id": str(uuid.uuid4()),
        "name": body.get("name", ""),
        "email": body.get("email", ""),
        "experience": body.get("experience", "intermediate"),
        "interests": body.get("interests", []),
        "budget_range": body.get("budget_range", ""),
        "demands": body.get("demands", ""),
        "chat_summary": body.get("chat_summary", ""),
        "submitted_at": datetime.now().isoformat(),
    }
    store.add_trip_signup(itinerary_id, signup)
    return {"success": True, "signup": signup}

@app.get("/api/trips/{itinerary_id}/signups")
def list_trip_signups(itinerary_id: str):
    return store.get_trip_signups(itinerary_id)

@app.post("/api/trips/{itinerary_id}/analyze")
async def analyze_signups(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    signups = store.get_trip_signups(itinerary_id)

    async def generate():
        analysis = {}
        async for event in stream_customer_analysis(signups, it):
            yield event
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "operator_selected":
                    analysis = data
            except:
                pass
        if analysis:
            store.save_trip_analysis(itinerary_id, analysis)

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/trips/{itinerary_id}/negotiate")
async def trip_negotiate(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    signups = store.get_trip_signups(itinerary_id)
    analysis = store.get_trip_analysis(itinerary_id)
    operator_id = analysis.get("operator_id", "op_nepal_trek") if analysis else "op_nepal_trek"
    operator = get_operator_by_id(operator_id)
    original_price = operator.get("price_per_day", 348) if operator else 348

    async def generate():
        all_messages = []
        deal = None
        async for event in stream_personalized_negotiation(signups, it, operator_id):
            yield event
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "message":
                    all_messages.append(data["message"])
                elif data.get("type") == "deal_reached":
                    deal = data["deal"]
            except:
                pass

        neg = {
            "itinerary_id": itinerary_id,
            "operator_id": operator_id,
            "operator_name": deal.get("operator_name", "Operator") if deal else "Operator",
            "status": "agreed" if deal else "active",
            "messages": all_messages,
            "original_price": original_price,
            "final_price": deal.get("price_per_day") if deal else None,
            "deal_terms": deal.get("summary") if deal else None,
            "deal": deal,
            "created_at": datetime.now().isoformat(),
        }
        store.save_trip_negotiation(itinerary_id, neg)

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/trips/{itinerary_id}/send-travelers")
def send_to_travelers(itinerary_id: str):
    it = store.get_itinerary(itinerary_id)
    if not it:
        raise HTTPException(404, "Itinerary not found")
    signups = store.get_trip_signups(itinerary_id)
    neg = store.get_trip_negotiation(itinerary_id)
    deal = neg.get("deal", {}) if neg else {}

    results = []
    for signup in signups:
        signup_id = signup.get("id", "")
        template = DEMO_TRAVELER_EMAILS.get(signup_id)
        if template:
            results.append({
                "name": signup["name"],
                "email": signup["email"],
                "subject": template["subject"],
                "preview": template["preview"],
                "personalized_note": template["personalized_note"],
                "sent": True,
            })
        else:
            results.append({
                "name": signup["name"],
                "email": signup["email"],
                "subject": f"Your Nepal Trek is Confirmed, {signup['name'].split()[0]}",
                "preview": f"Your 7-day Nepal trek is confirmed at operator land rate ${deal.get('price_per_day', 308)}/day (retail per trip budget).",
                "personalized_note": "Full itinerary and operator brief attached.",
                "sent": True,
            })

    return {"success": True, "emails_sent": len(results), "results": results}
