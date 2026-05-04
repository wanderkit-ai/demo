'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTrip } from '@/lib/api'
import {
  MapPin, Calendar, Users, DollarSign, CheckCircle2,
  Mountain, Loader2, Send, ChevronDown, ChevronUp, Bot, User
} from 'lucide-react'

interface ChatMsg {
  role: 'agent' | 'user'
  content: string
}

export default function TripPage() {
  const params = useParams()
  const id = params.id as string

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  // chat state
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [agentTyping, setAgentTyping] = useState(false)
  const [chatDone, setChatDone] = useState(false)
  const [savedProfile, setSavedProfile] = useState<any>(null)

  // final signup form (shown after chat)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getTrip(id)
      .then(data => { setTrip(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  // kick off the opener message automatically on load
  useEffect(() => {
    if (!loading && trip) {
      runAgentTurn([])
    }
  }, [loading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, agentTyping])

  const runAgentTurn = async (history: ChatMsg[]) => {
    setAgentTyping(true)
    const apiMessages = history.map(m => ({
      role: m.role === 'agent' ? 'assistant' : 'user',
      content: m.content,
    }))

    let agentText = ''
    let profile: any = null
    let showForm = false

    const res = await fetch(`/api/trips/${id}/customer-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
    })

    if (!res.body) { setAgentTyping(false); return }

    // placeholder message that we stream into
    setMessages(prev => [...prev, { role: 'agent', content: '' }])
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const event = JSON.parse(raw)
          if (event.type === 'text_delta') {
            agentText += event.text
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'agent', content: agentText }
              return updated
            })
          } else if (event.type === 'profile_saved') {
            profile = event.profile
          } else if (event.type === 'done') {
            showForm = event.show_form
          }
        } catch {}
      }
    }

    if (profile) setSavedProfile(profile)
    if (showForm) setChatDone(true)
    setAgentTyping(false)
  }

  const handleSend = async () => {
    if (!input.trim() || agentTyping) return
    const userMsg: ChatMsg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    await runAgentTurn(next)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    setSubmitting(true)
    await fetch(`/api/trips/${id}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        experience: savedProfile?.experience || 'intermediate',
        interests: savedProfile?.interests || [],
        budget_range: '',
        demands: savedProfile?.demands || '',
        chat_summary: savedProfile?.chat_summary || '',
      }),
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">Trip not found.</p>
      </div>
    )
  }

  const itinerary = trip.itinerary
  const days = itinerary?.days || []

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-stone-800 via-stone-700 to-amber-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now accepting travellers
          </div>
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            {itinerary?.title || itinerary?.destination}
          </h1>
          <p className="text-white/65 text-base mb-7 max-w-lg">
            A curated group adventure. Limited spots — the agent will personalise your experience based on your preferences.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, text: itinerary?.destination },
              { icon: Calendar, text: `${itinerary?.duration} days` },
              { icon: Users, text: `${trip.signup_count} joined` },
              { icon: DollarSign, text: itinerary?.budget || 'Pricing on request' },
            ].filter(i => i.text).map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 text-sm">
                <Icon className="w-3.5 h-3.5 text-amber-300" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

        {/* ── Itinerary highlights ── */}
        <div>
          <h2 className="text-lg font-bold text-stone-800 mb-1">The Journey</h2>
          <p className="text-sm text-stone-500 mb-5">Day-by-day plan — tap any day for details</p>
          <div className="space-y-2">
            {days.map((day: any) => (
              <div key={day.day} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-xs font-bold text-amber-700">
                    {day.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 text-sm">{day.title}</div>
                    <div className="text-xs text-stone-500">{day.location}</div>
                  </div>
                  {expandedDay === day.day
                    ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                </button>
                {expandedDay === day.day && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <ul className="mt-3 space-y-1.5">
                      {day.activities.map((act: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          {act}
                        </li>
                      ))}
                    </ul>
                    {day.accommodation && (
                      <p className="mt-2 text-xs text-stone-500">
                        <span className="font-medium">Stay:</span> {day.accommodation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat signup ── */}
        <div id="signup">
          <h2 className="text-lg font-bold text-stone-800 mb-1">Reserve Your Spot</h2>
          <p className="text-sm text-stone-500 mb-5">
            Chat with our agent — it'll ask you a few questions to understand what you're looking for, then personalise your experience with the operator.
          </p>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* chat messages */}
            <div className="px-5 pt-5 pb-3 space-y-4 max-h-[420px] overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'agent' ? 'bg-amber-100' : 'bg-stone-100'
                  }`}>
                    {msg.role === 'agent'
                      ? <Bot className="w-3.5 h-3.5 text-amber-600" />
                      : <User className="w-3.5 h-3.5 text-stone-500" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'agent'
                      ? 'bg-stone-100 text-stone-800 rounded-tl-sm'
                      : 'bg-amber-500 text-white rounded-tr-sm'
                  }`}>
                    {msg.content || <span className="opacity-50">...</span>}
                  </div>
                </div>
              ))}

              {agentTyping && messages[messages.length - 1]?.role !== 'agent' && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="bg-stone-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input row — shown until chat is done */}
            {!chatDone && !submitted && (
              <div className="border-t border-stone-100 px-4 py-3 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={agentTyping}
                  placeholder="Type your reply..."
                  className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={agentTyping || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors disabled:opacity-40 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Name + Email form — shown after chat completes */}
            {chatDone && !submitted && (
              <form onSubmit={handleSignup} className="border-t border-stone-100 px-5 py-4">
                <p className="text-xs text-stone-500 mb-3 font-medium">Almost done — enter your details to lock in your spot:</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !name || !email}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : 'Confirm My Spot'}
                </button>
              </form>
            )}

            {/* Success */}
            {submitted && (
              <div className="border-t border-stone-100 px-5 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-stone-800 mb-1">You're in, {name.split(' ')[0]}!</p>
                <p className="text-stone-500 text-sm max-w-xs mx-auto">
                  Your preferences have been noted. Once the operator is confirmed, you'll get a personalised email with your itinerary, price, and everything you asked for.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
