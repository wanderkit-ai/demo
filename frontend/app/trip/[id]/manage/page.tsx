'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOperators, getTrip, getTripSignups } from '@/lib/api'
import OperatorCard from '@/components/OperatorCard'
import {
  ArrowLeft, Users, Brain,
  Loader2, Mountain, Camera, Heart,
  Sparkles, Star, ChevronRight, Zap
} from 'lucide-react'

const INTEREST_ICONS: Record<string, any> = {
  adventure: Mountain,
  photography: Camera,
  cultural: Star,
  wellness: Heart,
  luxury: Sparkles,
}

const EXPERIENCE_COLORS: Record<string, string> = {
  beginner: 'bg-blue-50 text-blue-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-green-50 text-green-700',
}

type Step = 'signups' | 'analyzing' | 'analyzed'

export default function ManageTripPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [trip, setTrip] = useState<any>(null)
  const [signups, setSignups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('signups')
  const [analysisEvents, setAnalysisEvents] = useState<any[]>([])
  const [operators, setOperators] = useState<any[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([getTrip(id), getTripSignups(id), getOperators()])
      .then(([t, s, ops]) => {
        setTrip(t)
        setSignups(s)
        setOperators(ops)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [analysisEvents])

  const runAnalysis = async () => {
    setStep('analyzing')
    setAnalysisEvents([])

    const res = await fetch(`/api/trips/${id}/analyze`, { method: 'POST' })
    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const event = JSON.parse(raw)
          if (event.type === 'done') {
            setStep('analyzed')
          } else if (event.type === 'operator_selected') {
            setAnalysisEvents(prev => [...prev, event])
          } else {
            setAnalysisEvents(prev => [...prev, event])
          }
        } catch {}
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-10 flex items-center gap-2 text-notion-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    )
  }

  const itinerary = trip?.itinerary

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Header */}
      <button
        onClick={() => router.push(`/itinerary/${id}`)}
        className="flex items-center gap-2 text-sm text-notion-secondary hover:text-notion-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to itinerary
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-brand-600" />
          <span className="text-xs text-brand-600 font-semibold uppercase tracking-wider">Trip Pipeline</span>
        </div>
        <h1 className="text-2xl font-bold text-notion-text">{itinerary?.title}</h1>
        <p className="text-sm text-notion-secondary mt-1">{itinerary?.destination} · {itinerary?.duration} days</p>
      </div>

      {/* Pipeline steps */}
      <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
        {[
          { key: 'signups', label: 'Signups' },
          { key: 'analyzed', label: 'Analyze' },
          { key: 'negotiate', label: 'Negotiate' },
          { key: 'send', label: 'Send' },
        ].map((s, i) => {
          const done = (
            s.key === 'signups' ||
            (s.key === 'analyzed' && ['analyzed'].includes(step))
          )
          const active = (
            (s.key === 'signups' && step === 'signups') ||
            (s.key === 'analyzed' && ['analyzing', 'analyzed'].includes(step))
          )
          return (
            <div key={s.key} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="w-3 h-3 text-notion-muted" />}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                active ? 'bg-brand-600 text-white' :
                done ? 'bg-green-100 text-green-700' :
                'bg-notion-hover text-notion-muted'
              }`}>
                {done && !active ? '✓ ' : ''}{s.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="space-y-8">
        {/* ── Signups ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-notion-text">Customer Signups</h2>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">{signups.length}</span>
            </div>
            <a
              href={`/trip/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              View public page ↗
            </a>
          </div>

          <div className="space-y-3">
            {signups.map(s => (
              <div key={s.id} className="bg-warm-card border border-warm-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-notion-text text-sm">{s.name}</div>
                    <div className="text-xs text-notion-muted">{s.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${EXPERIENCE_COLORS[s.experience] || 'bg-gray-50 text-gray-600'}`}>
                    {s.experience}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.interests.map((int: string) => {
                    const Icon = INTEREST_ICONS[int]
                    return (
                      <span key={int} className="flex items-center gap-1 text-xs bg-notion-hover text-notion-secondary px-2 py-0.5 rounded-full capitalize">
                        {Icon && <Icon className="w-3 h-3" />}
                        {int}
                      </span>
                    )
                  })}
                </div>
                {(s.chat_summary || s.demands) && (
                  <div className="bg-notion-hover rounded-lg p-2.5">
                    <p className="text-xs text-notion-secondary leading-relaxed italic">
                      "{s.chat_summary || s.demands}"
                    </p>
                    <span className="text-[10px] text-notion-muted">extracted from intake chat</span>
                  </div>
                )}
              </div>
            ))}

            {signups.length === 0 && (
              <div className="border-2 border-dashed border-notion-border rounded-xl p-6 text-center">
                <p className="text-notion-muted text-sm mb-1">No customers yet.</p>
                <a href={`/trip/${id}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline">Share the trip page ↗</a>
              </div>
            )}
          </div>
        </section>

        {/* ── Analysis ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-notion-text">Agent Analysis</h2>
            </div>
            {step === 'signups' && (
              <button
                onClick={runAnalysis}
                className="flex items-center gap-1.5 text-sm bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Signups
              </button>
            )}
          </div>

          {step === 'signups' && (
            <div className="border-2 border-dashed border-notion-border rounded-xl p-6 text-center text-notion-muted text-sm">
              Click "Analyze Signups" to have the agent read all customer profiles and select the best operator.
            </div>
          )}

          {(step === 'analyzing' || analysisEvents.length > 0) && (
            <div className="bg-notion-hover rounded-xl p-4 space-y-2">
              {analysisEvents.map((ev, i) => (
                <div key={i}>
                  {ev.type === 'thinking' && (
                    <div className="flex items-center gap-2 text-xs text-notion-secondary italic">
                      <Loader2 className={`w-3 h-3 shrink-0 ${step === 'analyzing' && i === analysisEvents.length - 1 ? 'animate-spin' : ''}`} />
                      {ev.text}
                    </div>
                  )}
                  {ev.type === 'profile' && (
                    <div className="flex items-start gap-2 text-xs text-notion-text">
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                      <span><strong>Profile read:</strong> {ev.summary}</span>
                    </div>
                  )}
                </div>
              ))}
              {step === 'analyzing' && (
                <div className="flex items-center gap-2 text-xs text-brand-600 italic">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  Scoring operators...
                </div>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        {/* ── Operators ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-notion-text">All Operators</h2>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">{operators.length}</span>
            </div>
          </div>

          <div className="space-y-4">
            {operators.map(op => (
              <OperatorCard
                key={op.id}
                operator={op}
                onContact={() => router.push(`/negotiations?operator=${op.id}&itinerary=${id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
