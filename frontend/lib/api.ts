const API_BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export function getItineraries() {
  return request<any[]>('/itineraries')
}

export function getItinerary(id: string) {
  return request<any>(`/itineraries/${id}`)
}

export function createItinerary(data: any) {
  return request<any>('/itineraries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateItinerary(id: string, data: any) {
  return request<any>(`/itineraries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function publishItinerary(id: string) {
  return request<any>(`/itineraries/${id}/publish`, {
    method: 'POST',
  })
}

export function getOperators() {
  return request<any[]>('/operators')
}

export function getNegotiations() {
  return request<any[]>('/negotiations')
}

export function matchOperators(data: any) {
  return request<any>('/operators/match', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getChecklist(itineraryId: string) {
  return request<any>(`/checklist/${itineraryId}`)
}

export function generateChecklist(itineraryId: string, negotiationId?: string) {
  return request<any>('/checklist/generate', {
    method: 'POST',
    body: JSON.stringify({
      itinerary_id: itineraryId,
      negotiation_id: negotiationId,
    }),
  })
}

export function updateChecklistItem(itineraryId: string, itemId: string, data: any) {
  return request<any>(`/checklist/${itineraryId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function sendEmail(userEmail: string, itineraryId: string, negotiationId?: string) {
  return request<any>('/email/send', {
    method: 'POST',
    body: JSON.stringify({
      user_email: userEmail,
      itinerary_id: itineraryId,
      negotiation_id: negotiationId,
    }),
  })
}

export function resetDemo() {
  return request<any>('/demo/reset', {
    method: 'POST',
  })
}
