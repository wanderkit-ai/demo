from typing import Dict, List, Any

itineraries: Dict[str, Any] = {}
negotiations: Dict[str, Any] = {}
checklists: Dict[str, Any] = {}
conversations: Dict[str, List[Any]] = {}  # itinerary_id -> message history
trip_signups: Dict[str, List[Any]] = {}   # itinerary_id -> list of signups
trip_analyses: Dict[str, Any] = {}        # itinerary_id -> analysis result
trip_negotiations: Dict[str, Any] = {}    # itinerary_id -> personalized negotiation

def get_itinerary(id: str):
    return itineraries.get(id)

def save_itinerary(itinerary):
    itineraries[itinerary["id"]] = itinerary
    return itinerary

def get_negotiation(id: str):
    return negotiations.get(id)

def save_negotiation(neg):
    negotiations[neg["id"]] = neg
    return neg

def get_checklist(itinerary_id: str):
    return checklists.get(itinerary_id)

def save_checklist(checklist):
    checklists[checklist["itinerary_id"]] = checklist
    return checklist

def get_conversation(itinerary_id: str):
    return conversations.get(itinerary_id, [])

def save_conversation(itinerary_id: str, messages: list):
    conversations[itinerary_id] = messages

def get_trip_signups(itinerary_id: str) -> list:
    return trip_signups.get(itinerary_id, [])

def add_trip_signup(itinerary_id: str, signup: dict):
    if itinerary_id not in trip_signups:
        trip_signups[itinerary_id] = []
    trip_signups[itinerary_id].append(signup)

def save_trip_analysis(itinerary_id: str, analysis: dict):
    trip_analyses[itinerary_id] = analysis

def get_trip_analysis(itinerary_id: str):
    return trip_analyses.get(itinerary_id)

def save_trip_negotiation(itinerary_id: str, neg: dict):
    trip_negotiations[itinerary_id] = neg

def get_trip_negotiation(itinerary_id: str):
    return trip_negotiations.get(itinerary_id)
