# WanderKit — AI Travel Platform

Adventure travel influencer platform with Claude-powered agents for itinerary creation, operator matching, and deal negotiation.

## Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS (Notion-inspired)
- **Backend**: FastAPI, Python
- **AI**: Anthropic Claude (claude-sonnet-4-6) with multi-agent architecture

## Setup

### Backend
```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Agents

| Agent | Trigger | Tools |
|-------|---------|-------|
| **Itinerary Agent** | Chat on `/itinerary/new` | `update_itinerary`, `find_matching_operator` |
| **Operator Match Agent** | "Find Operators" button | `search_operators`, `get_operator_details` |
| **Negotiation Agent** | "Launch Negotiation" | `send_telegram`, `read_operator_response`, `finalize_deal` |
| **Checklist Agent** | "Generate Checklist" | Direct generation |

## Flow

1. **Create Itinerary** → Chat with AI → builds day-by-day plan in real-time → suggests operators
2. **Match Operators** → AI searches mock database → shows matched operators with constraints
3. **Negotiate** → AI agent negotiates via mock Telegram → reaches deal in 3 rounds
4. **Book** → Generate AI checklist → track tasks → send confirmation email
