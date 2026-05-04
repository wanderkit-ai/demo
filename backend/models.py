from pydantic import BaseModel
from typing import List, Optional, Any

class DayPlan(BaseModel):
    day: int
    title: str
    location: str
    activities: List[str]
    accommodation: str
    meals: str = ""
    notes: str = ""
    estimated_cost: str = ""

class Itinerary(BaseModel):
    id: str
    title: str
    destination: str
    duration: int
    budget: str
    style: str
    travelers: int = 2
    days: List[DayPlan] = []
    status: str = "draft"  # draft | published
    matched_operator: Optional[str] = None
    operator_note: Optional[str] = None
    created_at: str
    hero_image: str = ""

class Operator(BaseModel):
    id: str
    name: str
    destinations: List[str]
    styles: List[str]
    hotel_rating: float
    price_per_day: int
    specialties: List[str]
    description: str
    telegram_handle: str
    logo: str = ""
    match_score: int = 0

class NegotiationMessage(BaseModel):
    id: str
    sender: str  # "agent" | "operator"
    message: str
    timestamp: str

class Negotiation(BaseModel):
    id: str
    itinerary_id: str
    operator_id: str
    operator_name: str
    status: str = "active"  # active | agreed | failed
    messages: List[NegotiationMessage] = []
    original_price: Optional[float] = None
    final_price: Optional[float] = None
    deal_terms: Optional[str] = None
    created_at: str

class ChecklistItem(BaseModel):
    id: str
    category: str
    task: str
    done: bool = False
    deadline: str = ""
    notes: str = ""

class Checklist(BaseModel):
    id: str
    itinerary_id: str
    items: List[ChecklistItem] = []

class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str

class ChatRequest(BaseModel):
    itinerary_id: Optional[str] = None
    messages: List[ChatMessage]
    current_itinerary: Optional[Any] = None

class OperatorMatchRequest(BaseModel):
    itinerary_id: str
    destination: str
    style: str
    budget_per_day: float
    hotel_rating: float
    duration: int

class NegotiateRequest(BaseModel):
    itinerary_id: str
    operator_id: str

class EmailRequest(BaseModel):
    user_email: str
    itinerary_id: str
    negotiation_id: Optional[str] = None

class TripSignup(BaseModel):
    id: str
    name: str
    email: str
    experience: str  # beginner | intermediate | advanced
    interests: List[str]
    budget_range: str
    demands: str
    submitted_at: str

class TripSignupRequest(BaseModel):
    name: str
    email: str
    experience: str
    interests: List[str]
    budget_range: str
    demands: str
