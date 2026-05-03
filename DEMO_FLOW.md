# WanderKit Demo Flow

This demo shows how WanderKit turns a travel influencer's rough trip idea into a bookable, operator-backed itinerary, then uses AI agents to negotiate with local operators and generate the execution checklist.

## Product Story

WanderKit is an AI travel operations platform for adventure travel influencers.

The user starts with a natural-language trip idea. WanderKit builds the itinerary through chat, flags real-world supply constraints, matches a local operator, publishes the itinerary as an operator brief, negotiates the package over a simulated Telegram thread, creates the pre-trip checklist, and sends a final confirmation email.

The full loop is:

1. Influencer describes a trip.
2. AI asks questions and updates the itinerary.
3. AI identifies constraints, such as hotel quality limits on remote trekking routes.
4. AI recommends the best local operator.
5. User publishes the itinerary.
6. Negotiation agent reaches out to the operator.
7. Agent shares the itinerary and negotiates price and inclusions.
8. Platform generates a checklist from the itinerary and final deal.
9. User sends a confirmation email.

## Demo Setup

Run both services:

```bash
cd backend
python3 -m uvicorn main:app --reload --port 8001
```

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

The app is currently configured for a deterministic scripted demo by default. It does not require a live Anthropic API call unless `WANDERKIT_LIVE_AI=1` is set.

Before presenting, click **Reset demo** on the dashboard to restore the seeded demo state.

## Demo Script

### 1. Start From Dashboard

Open the dashboard at:

```text
http://localhost:3000
```

Point out the demo banner:

> Create a Nepal influencer itinerary, show the 4-star hotel constraint, match Himalaya Quest, publish the brief, negotiate from $150/day to $120/day, generate the checklist, then send confirmation.

Click **Start demo**.

### 2. Create The Itinerary Through Chat

On `/itinerary/new`, use the suggested demo prompt in the chat panel:

```text
Plan a 7-day luxury adventure trek in Nepal for a travel influencer with 250K followers. We want strong content moments, local culture, and operator support.
```

Optional second prompt:

```text
I want boutique 4-star hotels if possible, but be honest if the mountains can only support 3.5-star or premium teahouses.
```

Expected AI response:

> Yes. I can turn that into a publishable operator brief.
>
> One important constraint: on this Nepal trekking route, true 4-star hotels are available in Kathmandu, but not once you are above Lukla and Namche. The best realistic option is a 4-star boutique hotel in Kathmandu plus premium teahouses on the trail.
>
> I built a 7-day itinerary around that constraint and optimized it for an adventure travel influencer: high-viewpoint days, cultural stops, a gear-friendly pace, and a helicopter return that creates a strong closing moment.

Expected UI update:

- A 7-day Nepal itinerary appears in the main canvas.
- The plan includes Kathmandu, Lukla, Phakding, Namche Bazaar, Khumjung, Tengboche, and a helicopter return.
- The hotel constraint is visible in the itinerary notes.
- Matched operator cards appear below the itinerary.

### 3. Show Operator Matching

The AI recommends **Himalaya Quest Adventures**.

Expected AI explanation:

> I found Himalaya Quest Adventures as the best local operator match. They already support Nepal creator treks, can handle permits and camera gear logistics, and their route quality fits the adventure-luxury positioning.
>
> Constraint to say clearly in the demo: they cannot provide true 4-star hotels on the trekking route. They can offer 4-star Kathmandu nights and the best available premium teahouses in the mountains.

Talking point:

> The agent is not just generating a pretty itinerary. It understands operator inventory and tells the user when a request is not realistic.

### 4. Publish The Itinerary

Click **Publish Itinerary**.

Expected result:

- The itinerary status changes from draft to published.
- The app redirects to the itinerary detail page.
- The itinerary is now ready to use as the operator-facing brief.

Talking point:

> Publishing turns a conversational plan into a structured brief that the negotiation agent can send to local operators.

### 5. Launch Negotiation

Go to:

```text
/negotiations
```

Start a new negotiation if needed, or use the preloaded negotiation.

Select:

- Itinerary: **7-Day Nepal Creator Trek**
- Operator: **Himalaya Quest Adventures**

Click **Launch Negotiation Agent**.

Expected simulated Telegram flow:

Agent:

> Hi Himalaya Quest, sharing a 7-day Nepal creator trek brief for a travel influencer with 250K followers. They want a premium adventure route, Kathmandu boutique hotel nights, best-available mountain lodges, permit support, and content-friendly pacing. What is your best all-in rate?

Operator:

> Namaste! Great to connect. For this trek, we can offer $150/day per person with permits, certified guide, premium teahouses, meals on the trail, and Kathmandu logistics.

Agent:

> Thanks. The itinerary is a strong content opportunity and the influencer will tag the operator in the full trip series. Can you improve the rate by 15-20% and include support for camera gear?

Operator:

> We can do $130/day. Teahouse costs are fixed, but we can include porter support for camera gear and a monastery visit.

Agent:

> That is close. If you can reach $120/day and include a helicopter return to reduce fatigue on the final content day, we can confirm the package and send the final itinerary brief.

Operator:

> Excellent. $120/day confirmed with certified guide, permits, premium teahouses, camera porter support, and helicopter return. Kathmandu stays remain 4-star boutique hotels.

Expected deal:

- Original price: `$150/day`
- Final price: `$120/day`
- Added inclusions:
  - Certified trekking guide
  - Permits and park fees
  - Premium teahouses on trail
  - 4-star boutique Kathmandu hotel nights
  - Camera gear porter support
  - Helicopter return

Talking point:

> The agent uses the itinerary and influencer audience as leverage. It negotiates price, but also negotiates operational details that matter for the actual trip.

### 6. Generate Checklist

Go to:

```text
/bookings
```

Select **7-Day Nepal Creator Trek**.

Click **Generate Checklist**.

Expected checklist categories:

- Travel Documents
- Flights & Transport
- Accommodation
- Activities & Tours
- Health & Safety
- Packing
- Money & Payments
- Communication
- Content Creation

Example checklist items:

- Verify passport validity and Nepal visa requirements.
- Confirm Kathmandu arrival and Lukla weather buffer.
- Confirm 4-star Kathmandu hotel nights.
- Schedule altitude medication and insurance review.
- Prepare operator deposit and final payment schedule.
- Finalize shot list for Kathmandu, Namche, and helicopter return.

Talking point:

> The checklist is generated from the actual itinerary and the negotiated deal, so it includes things like altitude insurance, operator deposit timing, and content backup routines.

### 7. Send Final Confirmation

In the email section, enter:

```text
demo@wanderkit.test
```

Click **Send**.

Expected response:

```text
Email sent successfully!
```

Backend mock response:

```text
Confirmation email sent to demo@wanderkit.test
Subject: Your WanderKit Trip: 7-Day Nepal Creator Trek
Preview: Confirmed: 7 days in Nepal — your adventure awaits!
```

Talking point:

> The workflow ends with a confirmation package, not just a generated itinerary. This is the transition from planning to execution.

## Recommended Pitch Line

Use this sentence to frame the product:

> WanderKit turns a travel influencer's rough trip idea into a bookable operator-backed itinerary, then uses AI agents to negotiate with local operators and generate the execution checklist.

## Key Demo Moments

The strongest moments to emphasize:

- The user does not fill out a form. They describe the trip naturally in chat.
- The AI updates a structured itinerary in real time.
- The AI is honest about real-world constraints, such as 4-star hotel availability in the Himalayas.
- The system matches an operator based on destination, style, budget, and constraints.
- The negotiation agent uses the itinerary as context instead of sending a generic message.
- The deal improves from `$150/day` to `$120/day` and adds operational value.
- The checklist reflects the actual trip and final deal.
- The workflow ends with a confirmation email.

## Implementation Notes

The deterministic demo content lives in:

```text
backend/demo_content.py
```

The backend seeds demo data on startup and exposes:

```text
POST /api/demo/reset
```

By default, the demo agents use scripted content. To enable live AI behavior, set:

```bash
WANDERKIT_LIVE_AI=1
ANTHROPIC_API_KEY=your_key
```

For the final presentation, scripted mode is recommended because it avoids network latency, API failures, and unpredictable model output.
