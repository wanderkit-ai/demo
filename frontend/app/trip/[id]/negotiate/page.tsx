'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTrip, sendToTravelers } from '@/lib/api'
import {
  ArrowLeft, CheckCircle2, Loader2, Send,
  Mountain, Mail, Users, Check
} from 'lucide-react'

interface Msg {
  id: string
  sender: 'agent' | 'operator'
  message: string
  timestamp: string
}

export default function NegotiatePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [trip, setTrip] = useState<any>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [streaming, setStreaming] = useState(false)
  const [deal, setDeal] = useState<any>(null)
  const [done, setDone] = useState(false)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailResults, setEmailResults] = useState<any[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const autoNotified = useRef(false)

  useEffect(() => {
    getTrip(id).then(setTrip)
    if (!started.current) {
      started.current = true
      startNegotiation()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming, deal])

  useEffect(() => {
    if (!done || !deal || sendingEmails || emailResults.length > 0 || autoNotified.current) return
    autoNotified.current = true
    handleSendEmails()
  }, [done, deal, sendingEmails, emailResults.length])

  const startNegotiation = async () => {
    setStreaming(true)
    const res = await fetch(`/api/trips/${id}/negotiate`, { method: 'POST' })
    if (!res.body) { setStreaming(false); return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done: eof, value } = await reader.read()
      if (eof) break
      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const event = JSON.parse(raw)
          if (event.type === 'message') {
            setMessages(prev => [...prev, event.message])
          } else if (event.type === 'deal_reached') {
            setDeal(event.deal)
          } else if (event.type === 'done') {
            setStreaming(false)
            setDone(true)
          }
        } catch {}
      }
    }
    setStreaming(false)
  }

  const handleSendEmails = async () => {
    setSendingEmails(true)
    const result = await sendToTravelers(id)
    setEmailResults(result.results || [])
    setSendingEmails(false)
  }

  const itinerary = trip?.itinerary
  const operatorName = deal?.operator_name || 'Access Nepal Tours & Trekking'

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  return (
    <div className="flex flex-col h-screen bg-[#ECE5DD]" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── WhatsApp header bar ── */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 shrink-0 shadow-md">
        <button
          onClick={() => router.push(`/trip/${id}/manage`)}
          aria-label="Back to trip management"
          className="text-white/70 hover:text-white transition-colors mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Operator avatar */}
        <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center shrink-0">
          <Mountain className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{operatorName}</div>
          <div className="text-xs text-white/60">
            {streaming ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                typing...
              </span>
            ) : done ? 'Deal agreed' : 'online'}
          </div>
        </div>

        {deal && (
          <div className="text-right shrink-0">
            <div className="text-xs text-white/60">Final price</div>
            <div className="font-bold text-[#25D366]">${deal.price_per_day}/day</div>
          </div>
        )}
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">

        {/* Context banner */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/60 rounded-xl px-4 py-2 text-xs text-stone-500 text-center max-w-xs shadow-sm">
            <div className="font-medium text-stone-600 mb-0.5">Noma Agent · {itinerary?.destination}</div>
            Negotiating a custom group package for {trip?.signup_count || 3} travellers
          </div>
        </div>

        {messages.map((msg, i) => {
          const isAgent = msg.sender === 'agent'
          return (
            <div key={msg.id || i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isAgent ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* sender label — first in a run */}
                {(i === 0 || messages[i - 1]?.sender !== msg.sender) && (
                  <span className={`text-[11px] font-semibold mb-1 px-1 ${isAgent ? 'text-[#075E54] text-right' : 'text-[#128C7E]'}`}>
                    {isAgent ? 'Noma Agent' : operatorName}
                  </span>
                )}
                <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed whitespace-pre-line relative ${
                  isAgent
                    ? 'bg-[#DCF8C6] text-stone-800 rounded-tr-sm'
                    : 'bg-white text-stone-800 rounded-tl-sm'
                }`}>
                  {msg.message}
                  {/* WhatsApp-style tick + time */}
                  <div className={`flex items-center gap-1 mt-1 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-stone-400">{formatTime(msg.timestamp)}</span>
                    {isAgent && <Check className="w-3 h-3 text-[#34B7F1]" />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Deal reached card ── */}
        {deal && (
          <div className="flex justify-center my-4">
            <div className="bg-white rounded-2xl shadow-md p-5 w-full max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-stone-800 text-sm">Deal Agreed</div>
                  <div className="text-xs text-stone-500">{operatorName}</div>
                </div>
                <div className="ml-auto text-xl font-bold text-[#075E54]">${deal.price_per_day}<span className="text-xs font-normal text-stone-400">/day</span></div>
              </div>
              <p className="text-xs text-stone-500 mb-3 leading-relaxed">{deal.summary}</p>
              <ul className="space-y-1 mb-4">
                {(deal.inclusions || []).map((inc: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                    {inc}
                  </li>
                ))}
              </ul>

              {/* Auto notify travelers */}
              {sendingEmails ? (
                <div className="w-full flex items-center justify-center gap-2 bg-[#075E54] text-white font-semibold py-2.5 rounded-xl text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Auto-sending to all travellers...
                </div>
              ) : emailResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4" />
                    {emailResults.length} travellers auto-notified
                  </div>
                  {emailResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-600 bg-green-50 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.name}</div>
                        <div className="text-stone-400 truncate text-[11px]">{r.subject}</div>
                      </div>
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-500 font-medium py-2.5 rounded-xl text-sm">
                  <Send className="w-4 h-4" /> Notifications will send automatically
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
