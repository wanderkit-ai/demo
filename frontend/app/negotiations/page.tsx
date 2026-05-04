'use client'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getNegotiations, getOperators, getItineraries, sendEmail } from '@/lib/api'
import {
  MessageSquare, Send, Bot, User, CheckCircle2,
  XCircle, Clock, DollarSign, Loader2, Plus, Sparkles, ClipboardList, Mail
} from 'lucide-react'

interface Message {
  id: string
  sender: 'agent' | 'operator'
  message: string
  timestamp: string
}

interface Negotiation {
  id: string
  itinerary_id: string
  operator_id: string
  operator_name: string
  status: string
  messages: Message[]
  original_price: number
  final_price: number | null
  deal_terms: string | null
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'In Progress', color: 'text-amber-600 bg-amber-50', icon: Clock },
  agreed: { label: 'Deal Agreed', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  failed: { label: 'No Deal', color: 'text-red-600 bg-red-50', icon: XCircle },
}

const DEMO_TRAVELER_REQUIREMENTS = {
  per_traveler: [
    'Passport copy (valid 6+ months past departure)',
    'Travel insurance certificate covering trekking + helicopter evacuation',
    'Medical fitness declaration',
    'Emergency contact name and phone number',
    'Dietary preferences and any allergies',
  ],
  content_creator: [
    'Camera and drone equipment list for customs clearance',
    'Drone model and serial number for permit filing',
  ],
}

function NegotiationsContent() {
  const searchParams = useSearchParams()
  const [negotiations, setNegotiations] = useState<Negotiation[]>([])
  const [selected, setSelected] = useState<Negotiation | null>(null)
  const [operators, setOperators] = useState<any[]>([])
  const [itineraries, setItineraries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // New negotiation
  const [showNew, setShowNew] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState('')
  const [selectedOperator, setSelectedOperator] = useState('')
  const [negotiating, setNegotiating] = useState(false)
  const [liveMessages, setLiveMessages] = useState<Message[]>([])
  const [agentThinking, setAgentThinking] = useState('')
  const [dealReached, setDealReached] = useState<any>(null)
  const [operatorRequirements, setOperatorRequirements] = useState<any>(null)
  const [emailAddr, setEmailAddr] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opId = searchParams.get('operator')
    const itId = searchParams.get('itinerary')

    Promise.all([getNegotiations(), getOperators(), getItineraries()])
      .then(([negs, ops, its]) => {
        setNegotiations(negs)
        setOperators(ops)
        setItineraries(its)
        // Only auto-select first negotiation when NOT coming from operator contact
        if (negs.length > 0 && !opId) setSelected(negs[0])
        setLoading(false)
      })

    // Pre-fill from URL params — opens fresh negotiation form
    if (opId) { setSelectedOperator(opId); setShowNew(true) }
    if (itId) setSelectedItinerary(itId)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveMessages, agentThinking])

  const startNegotiation = async () => {
    if (!selectedItinerary || !selectedOperator) return
    setNegotiating(true)
    setLiveMessages([])
    setAgentThinking('')
    setDealReached(null)
    setOperatorRequirements(null)
    setEmailAddr('')
    setEmailSent(false)

    const res = await fetch('/api/negotiations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary_id: selectedItinerary, operator_id: selectedOperator })
    })

    const negId = res.headers.get('X-Negotiation-Id')
    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const event = JSON.parse(raw)
          if (event.type === 'agent_thinking') {
            setAgentThinking(event.text)
          } else if (event.type === 'message') {
            setLiveMessages(prev => [...prev, event.message])
            setAgentThinking('')
          } else if (event.type === 'deal_reached') {
            setDealReached(event.deal)
          } else if (event.type === 'operator_requirements') {
            setOperatorRequirements(event.requirements)
          } else if (event.type === 'done') {
            setAgentThinking('')
            // Refresh negotiations list
            getNegotiations().then(negs => {
              setNegotiations(negs)
              const newNeg = negs.find((n: any) => n.id === negId)
              if (newNeg) setSelected(newNeg)
            })
          }
        } catch {}
      }
    }

    setNegotiating(false)
    setShowNew(false)
  }

  const selectedOp = operators.find(o => o.id === (selected?.operator_id || selectedOperator))
  const displayMessages = selected ? selected.messages : liveMessages

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Negotiation list */}
      <div className="w-[280px] border-r border-notion-border flex flex-col bg-notion-sidebar shrink-0">
        <div className="px-4 py-4 border-b border-notion-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-notion-text text-sm">Negotiations</h2>
            <button
              onClick={() => { setShowNew(true); setSelected(null) }}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-notion-border transition-colors text-notion-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {negotiations.map(neg => {
            const cfg = statusConfig[neg.status] || statusConfig.active
            const Icon = cfg.icon
            return (
              <button
                key={neg.id}
                onClick={() => { setSelected(neg); setShowNew(false); setEmailSent(false); setEmailAddr('') }}
                className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                  selected?.id === neg.id ? 'bg-white shadow-sm' : 'hover:bg-notion-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-notion-text truncate flex-1 mr-2">
                    {neg.operator_name}
                  </span>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.color.split(' ')[0]}`} />
                </div>
                <div className="text-xs text-notion-muted">
                  {neg.status === 'agreed' ? `$${neg.final_price}/day` : neg.status}
                </div>
              </button>
            )
          })}

          {negotiations.length === 0 && !showNew && (
            <div className="text-center py-8">
              <MessageSquare className="w-6 h-6 text-notion-muted mx-auto mb-2" />
              <p className="text-xs text-notion-muted">No negotiations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Start new negotiation */}
        {showNew && !negotiating && !liveMessages.length && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-notion-text">Start Negotiation</h2>
                  <p className="text-xs text-notion-muted">AI agent will negotiate on your behalf via Telegram</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-notion-secondary mb-1.5">Select Itinerary</label>
                  <select
                    value={selectedItinerary}
                    onChange={e => setSelectedItinerary(e.target.value)}
                    className="w-full text-sm border border-notion-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="">Choose an itinerary...</option>
                    {itineraries.map((it: any) => (
                      <option key={it.id} value={it.id}>{it.title || it.destination} ({it.duration} days)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-notion-secondary mb-1.5">Select Operator</label>
                  <select
                    value={selectedOperator}
                    onChange={e => setSelectedOperator(e.target.value)}
                    className="w-full text-sm border border-notion-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="">Choose an operator...</option>
                    {operators.map((op: any) => (
                      <option key={op.id} value={op.id}>{op.name} — from ${op.price_per_day}/day</option>
                    ))}
                  </select>
                </div>

                {selectedOperator && (
                  <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-700">
                    <strong>Strategy:</strong> Agent will aim for 15-20% below asking price over 2-3 rounds.
                    The operator's standard rate is ${operators.find(o => o.id === selectedOperator)?.price_per_day}/day.
                  </div>
                )}

                <button
                  onClick={startNegotiation}
                  disabled={!selectedItinerary || !selectedOperator}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  Launch Negotiation Agent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live / completed negotiation thread */}
        {(negotiating || liveMessages.length > 0 || selected) && (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-notion-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-notion-text">
                    {selected?.operator_name || operators.find(o => o.id === selectedOperator)?.name || 'Negotiation'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {selected && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[selected.status]?.color || ''}`}>
                        {statusConfig[selected.status]?.label || selected.status}
                      </span>
                    )}
                    {negotiating && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Negotiating...
                      </span>
                    )}
                    {(selected?.original_price || selectedOp?.price_per_day) && (
                      <span className="text-xs text-notion-muted">
                        Original: ${selected?.original_price || selectedOp?.price_per_day}/day
                      </span>
                    )}
                    {(selected?.final_price || dealReached?.price_per_day) && (
                      <span className="text-xs text-green-600 font-semibold">
                        → ${selected?.final_price || dealReached?.price_per_day}/day agreed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {displayMessages.map((msg, i) => (
                <div key={msg.id || i} className={`flex gap-3 message-bubble ${msg.sender === 'agent' ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.sender === 'agent' ? 'bg-brand-100' : 'bg-amber-100'
                  }`}>
                    {msg.sender === 'agent'
                      ? <Bot className="w-4 h-4 text-brand-600" />
                      : <User className="w-4 h-4 text-amber-600" />
                    }
                  </div>
                  <div className="max-w-[75%]">
                    <div className={`text-xs font-medium mb-1 ${msg.sender === 'agent' ? 'text-brand-600' : 'text-amber-600 text-right'}`}>
                      {msg.sender === 'agent' ? 'Noma Agent' : selectedOp?.name || 'Operator'}
                    </div>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'agent'
                        ? 'bg-notion-hover text-notion-text rounded-tl-sm'
                        : 'bg-amber-50 text-notion-text rounded-tr-sm border border-amber-200'
                    }`}>
                      {msg.message}
                    </div>
                    <div className="text-xs text-notion-muted mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Agent thinking */}
              {agentThinking && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-100 text-xs text-brand-700 italic">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span className="line-clamp-2">{agentThinking}</span>
                </div>
              )}

              {/* Deal summary */}
              {(dealReached || (selected?.status === 'agreed' && selected?.deal_terms)) && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">Deal Reached!</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-1">
                      ${dealReached?.price_per_day || selected?.final_price}/person/day
                    </div>
                    <p className="text-xs">{dealReached?.summary || selected?.deal_terms}</p>
                    {(dealReached?.inclusions || []).length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {(dealReached?.inclusions || []).map((inc: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Per-traveler requirements from operator */}
              {(operatorRequirements || selected?.status === 'agreed') && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-700">Required from Each Traveler</span>
                  </div>
                  {(() => {
                    const reqs = operatorRequirements || DEMO_TRAVELER_REQUIREMENTS
                    return (
                  <div className="space-y-3">
                    {reqs.per_traveler?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Per traveler (both)</div>
                        <ul className="space-y-1">
                          {reqs.per_traveler.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reqs.content_creator?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Content creator add-ons</div>
                        <ul className="space-y-1">
                          {reqs.content_creator.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-blue-600 italic mt-1">These requirements are added to your checklist automatically.</p>
                  </div>
                    )
                  })()}
                </div>
              )}

              {/* Email travelers after deal */}
              {(dealReached || selected?.status === 'agreed') && (
                <div className="rounded-xl border border-notion-border bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-brand-600" />
                    <span className="font-semibold text-notion-text text-sm">Notify Travelers</span>
                  </div>
                  {emailSent ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmation email sent to travelers!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailAddr}
                        onChange={e => setEmailAddr(e.target.value)}
                        placeholder="traveler@email.com"
                        className="flex-1 text-sm border border-notion-border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
                      />
                      <button
                        onClick={async () => {
                          if (!emailAddr) return
                          setSendingEmail(true)
                          const itId = selected?.itinerary_id || selectedItinerary
                          const negId = selected?.id
                          await sendEmail(emailAddr, itId, negId)
                          setEmailSent(true)
                          setSendingEmail(false)
                        }}
                        disabled={!emailAddr || sendingEmail}
                        className="flex items-center gap-2 text-sm bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {sendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </>
        )}

        {/* Empty state */}
        {!showNew && !selected && !negotiating && !liveMessages.length && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-notion-muted mx-auto mb-3" />
              <p className="text-notion-secondary font-medium mb-1">No negotiation selected</p>
              <p className="text-sm text-notion-muted mb-4">Start a new negotiation or select one from the list</p>
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-2 bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" /> New Negotiation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NegotiationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-notion-muted">Loading negotiations...</div>}>
      <NegotiationsContent />
    </Suspense>
  )
}
