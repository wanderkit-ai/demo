'use client'
import { useEffect, useState } from 'react'
import { getItineraries, getNegotiations, getChecklist, generateChecklist, updateChecklistItem } from '@/lib/api'
import {
  CheckSquare, Square, Loader2, Mail, ChevronDown, ChevronRight,
  AlertCircle, Plane, Hotel, Activity, Shield, Package, CreditCard,
  Smartphone, Camera, FileText, ClipboardList
} from 'lucide-react'

const categoryIcons: Record<string, any> = {
  'Traveler Requirements': ClipboardList,
  'Travel Documents': FileText,
  'Flights & Transport': Plane,
  'Accommodation': Hotel,
  'Activities & Tours': Activity,
  'Health & Safety': Shield,
  'Packing': Package,
  'Money & Payments': CreditCard,
  'Communication': Smartphone,
  'Content Creation': Camera,
}

const categoryOrder = [
  'Traveler Requirements',
  'Travel Documents',
  'Flights & Transport',
  'Accommodation',
  'Activities & Tours',
  'Health & Safety',
  'Packing',
  'Money & Payments',
  'Communication',
  'Content Creation',
]

const priorityColors: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-green-600',
}

export default function BookingsPage() {
  const [itineraries, setItineraries] = useState<any[]>([])
  const [negotiations, setNegotiations] = useState<any[]>([])
  const [selectedIt, setSelectedIt] = useState('')
  const [checklist, setChecklist] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    Promise.all([getItineraries(), getNegotiations()]).then(([its, negs]) => {
      setItineraries(its)
      setNegotiations(negs)
      if (its.length > 0) setSelectedIt(its[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedIt) return
    setLoading(true)
    getChecklist(selectedIt)
      .then(data => {
        setChecklist(data)
        setLoading(false)
      })
      .catch(() => {
        setChecklist(null)
        setLoading(false)
      })
  }, [selectedIt])

  const handleGenerate = async () => {
    if (!selectedIt) return
    setGenerating(true)
    const agreedNeg = negotiations.find(n => n.itinerary_id === selectedIt && n.status === 'agreed')
    const data = await generateChecklist(selectedIt, agreedNeg?.id)
    setChecklist(data)
    setGenerating(false)
  }

  const toggleItem = async (itemId: string, done: boolean) => {
    if (!checklist) return
    const updated = await updateChecklistItem(selectedIt, itemId, { done })
    setChecklist(updated)
  }

  // Group items by category
  const grouped: Record<string, any[]> = {}
  if (checklist?.items) {
    for (const item of checklist.items) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }
  }

  const totalItems = checklist?.items?.length || 0
  const doneItems = checklist?.items?.filter((i: any) => i.done).length || 0
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const selectedItData = itineraries.find(i => i.id === selectedIt)
  const agreedDeal = negotiations.find(n => n.itinerary_id === selectedIt && n.status === 'agreed')

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-notion-text mb-1">Bookings & Checklist</h1>
        <p className="text-sm text-notion-secondary">Track everything you need before departure.</p>
      </div>

      {/* Itinerary selector */}
      <div className="flex items-center gap-3 mb-6">
        <select
          aria-label="Select itinerary"
          value={selectedIt}
          onChange={e => setSelectedIt(e.target.value)}
          className="text-sm border border-notion-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-brand-400 flex-1"
        >
          <option value="">Select itinerary...</option>
          {itineraries.map((it: any) => (
            <option key={it.id} value={it.id}>{it.title || it.destination}</option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={!selectedIt || generating}
          className="flex items-center gap-2 text-sm bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
          {generating ? 'Generating...' : 'Generate Checklist'}
        </button>
      </div>

      {/* Deal banner */}
      {agreedDeal && (
        <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <div className="text-sm text-green-700">
            <strong>{agreedDeal.operator_name}</strong> deal confirmed at
            <strong> ${agreedDeal.final_price}/day</strong>
          </div>
        </div>
      )}

      {/* Progress */}
      {checklist && totalItems > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-notion-border bg-notion-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-notion-text">Pre-trip Progress</span>
            <span className="text-sm font-bold text-brand-600">{progress}%</span>
          </div>
          <div className="h-2 bg-notion-border rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-notion-muted mt-1.5">{doneItems} of {totalItems} tasks complete</div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-notion-hover rounded-lg animate-pulse" />)}
        </div>
      )}

      {/* No checklist */}
      {!loading && !checklist && selectedIt && (
        <div className="text-center py-12 border-2 border-dashed border-notion-border rounded-xl">
          <CheckSquare className="w-8 h-8 text-notion-muted mx-auto mb-3" />
          <p className="text-notion-secondary mb-4">No checklist yet for this itinerary</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Generate with AI
          </button>
        </div>
      )}

      {/* Checklist grouped by category */}
      {checklist && (
        <div className="space-y-4 mb-8">
          {[...categoryOrder.filter(c => grouped[c]), ...Object.keys(grouped).filter(c => !categoryOrder.includes(c))].map(cat => {
            const items = grouped[cat]
            if (!items) return null
            const Icon = categoryIcons[cat] || CheckSquare
            const catDone = items.filter((i: any) => i.done).length
            const isCollapsed = collapsed[cat]
            const isTravelerReq = cat === 'Traveler Requirements'

            return (
              <div key={cat} className={`border rounded-xl overflow-hidden ${isTravelerReq ? 'border-blue-200' : 'border-notion-border'}`}>
                <button
                  onClick={() => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isTravelerReq ? 'bg-blue-50 hover:bg-blue-100' : 'bg-notion-hover hover:bg-notion-border/50'}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isTravelerReq ? 'text-blue-600' : 'text-brand-600'}`} />
                  <span className={`font-medium text-sm flex-1 text-left ${isTravelerReq ? 'text-blue-800' : 'text-notion-text'}`}>{cat}</span>
                  <span className="text-xs text-notion-muted mr-2">{catDone}/{items.length}</span>
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4 text-notion-muted" />
                    : <ChevronDown className="w-4 h-4 text-notion-muted" />
                  }
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-notion-border">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-notion-hover/50 transition-colors cursor-pointer ${item.done ? 'opacity-60' : ''}`}
                        onClick={() => toggleItem(item.id, !item.done)}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.done
                            ? <CheckSquare className="w-4 h-4 text-brand-600" />
                            : <Square className="w-4 h-4 text-notion-muted" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${item.done ? 'line-through text-notion-muted' : 'text-notion-text'}`}>
                            {item.task}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-notion-muted mt-0.5">{item.notes}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.deadline && (
                            <span className="text-xs text-notion-muted">{item.deadline}</span>
                          )}
                          {item.priority && (
                            <span className={`text-xs font-medium ${priorityColors[item.priority] || 'text-notion-muted'}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Traveler notifications */}
      {checklist && (
        <div className="border border-notion-border rounded-xl p-5">
          <h3 className="font-semibold text-notion-text mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-600" />
            Traveler Notifications
          </h3>
          <div className="flex items-start gap-2 text-sm text-notion-secondary">
            <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-notion-text">Notifications are automatic</div>
              <div className="text-xs mt-0.5">
                Traveler emails are sent automatically from the trip negotiation flow after a deal is agreed.
                No manual email entry is required.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
