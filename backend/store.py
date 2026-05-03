from typing import Dict, List, Any

itineraries: Dict[str, Any] = {}
negotiations: Dict[str, Any] = {}
checklists: Dict[str, Any] = {}
conversations: Dict[str, List[Any]] = {}  # itinerary_id -> message history

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
