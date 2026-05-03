'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getItineraries, getNegotiations, resetDemo } from '@/lib/api'
import {
  Plus, Map, MessageSquare, Globe,
  TrendingUp, ArrowRight, Mountain, Compass, Star
} from 'lucide-react'

export default function Dashboard() {
  const [itineraries, setItineraries] = useState<any[]>([])
  const [negotiations, setNegotiations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    Promise.all([getItineraries(), getNegotiations()])
      .then(([its, negs]) => { setItineraries(its); setNegotiations(negs) })
      .finally(() => setLoading(false))
  }, [])

  const published = itineraries.filter(i => i.status === 'published').length
  const agreed = negotiations.filter(n => n.status === 'agreed').length

  const handleResetDemo = async () => {
    setResetting(true)
    await resetDemo()
    const [its, negs] = await Promise.all([getItineraries(), getNegotiations()])
    setItineraries(its)
    setNegotiations(negs)
    setResetting(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-text mb-0.5">Welcome back</h1>
        <p className="text-sm text-warm-secondary">Your adventure travel command center.</p>
      </div>

      <div className="mb-8 rounded-xl border border-brand-200 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-warm-text mb-1">Final demo flow</h2>
            <p className="text-sm text-warm-secondary max-w-2xl">
              Create a Nepal influencer itinerary, show the 4-star hotel constraint, match Himalaya Quest,
              publish the brief, negotiate from $150/day to $120/day, generate the checklist, then send confirmation.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="text-sm border border-warm-border text-warm-secondary px-3 py-2 rounded-lg hover:border-brand-300 hover:text-warm-text transition-colors disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Reset demo'}
            </button>
            <Link
              href="/itinerary/new"
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Start demo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Itineraries', value: itineraries.length, icon: Map },
          { label: 'Published', value: published, icon: Globe },
          { label: 'Negotiations', value: negotiations.length, icon: MessageSquare },
          { label: 'Deals Agreed', value: agreed, icon: TrendingUp },
        ].map(stat => (
          <div key={stat.label} className="bg-warm-card border border-warm-border rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-warm-muted font-semibold uppercase tracking-wide">{stat.label}</span>
              <stat.icon className="w-3.5 h-3.5 text-warm-muted" />
            </div>
            <div className="text-2xl font-bold text-warm-text">{loading ? '—' : stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Itineraries */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-warm-text text-sm">Your Itineraries</h2>
            <Link href="/itinerary/new" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              <Plus className="w-3 h-3" /> New
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-warm-cream rounded-lg animate-pulse" />)}
            </div>
          ) : itineraries.length === 0 ? (
            <div className="border-2 border-dashed border-warm-border rounded-xl p-8 text-center">
              <Compass className="w-8 h-8 text-warm-muted mx-auto mb-3" />
              <p className="text-warm-secondary text-sm mb-4">No itineraries yet</p>
              <Link
                href="/itinerary/new"
                className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create First Itinerary
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {itineraries.map(it => (
                <Link
                  key={it.id}
                  href={`/itinerary/${it.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-warm-card border border-warm-border hover:border-brand-300 hover:shadow-card transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <Mountain className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-warm-text text-sm truncate">{it.title || it.destination}</div>
                    <div className="text-xs text-warm-muted">{it.duration} days · {it.destination}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    it.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-warm-cream text-warm-muted'
                  }`}>
                    {it.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-warm-muted group-hover:text-brand-600 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-semibold text-warm-text text-sm mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/itinerary/new', icon: Plus, label: 'New Itinerary', desc: 'Plan with AI' },
              { href: '/operators', icon: Mountain, label: 'Browse Operators', desc: 'Find hiking experts' },
              { href: '/negotiations', icon: MessageSquare, label: 'Negotiations', desc: 'Active deals' },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-lg bg-warm-card border border-warm-border hover:border-brand-300 transition-all"
              >
                <a.icon className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-warm-text">{a.label}</div>
                  <div className="text-xs text-warm-muted">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured operators teaser */}
          <div className="mt-5">
            <h2 className="font-semibold text-warm-text text-sm mb-3">Top Operators</h2>
            <div className="space-y-2">
              {[
                { name: 'Himalaya Quest', rating: 4.9, location: 'Nepal' },
                { name: 'Wild Patagonia', rating: 4.8, location: 'Chile' },
                { name: 'Inca Trail Specialists', rating: 4.9, location: 'Peru' },
              ].map(op => (
                <Link
                  key={op.name}
                  href="/operators"
                  className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-warm-cream transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <Mountain className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-warm-text truncate">{op.name}</div>
                    <div className="text-xs text-warm-muted">{op.location}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-warm-text">{op.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
