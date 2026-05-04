'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatPanel from '@/components/ChatPanel'
import ItineraryBlock from '@/components/ItineraryBlock'
import { updateItinerary, createItinerary, publishItinerary } from '@/lib/api'
import {
  Map, Globe, Clock, Users, DollarSign, Send,
  Check, ChevronRight, Sparkles
} from 'lucide-react'

export default function NewItineraryPage() {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<any>(null)
  const [itineraryId, setItineraryId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState(false)

  const handleItineraryUpdate = async (data: any) => {
    setItinerary(data)
    if (!itineraryId) {
      const saved = await createItinerary(data)
      setItineraryId(saved.id)
    } else {
      await updateItinerary(itineraryId, data)
    }
  }

  // kept for ChatPanel prop compatibility — operators no longer shown
  const handleOperatorSuggestion = (_operators: any[]) => {}

  const handlePublish = async () => {
    if (!itineraryId) return
    setSaving(true)
    await publishItinerary(itineraryId)
    setPublished(true)
    setSaving(false)
    setTimeout(() => router.push(`/itinerary/${itineraryId}`), 1200)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Itinerary Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Empty state */}
          {!itinerary ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-notion-text mb-2">Plan Your Next Journey</h1>
              <p className="text-notion-secondary max-w-sm mb-6">
                Tell our AI assistant where you want to go. It'll ask the right questions and build your itinerary in real-time.
              </p>
              <div className="flex flex-col gap-2 text-sm text-notion-muted">
                <span className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-brand-500" /> "Plan a 7-day luxury trip to Bali"</span>
                <span className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-brand-500" /> "I want to trek in Nepal for 10 days"</span>
                <span className="flex items-center gap-2"><ChevronRight className="w-3.5 h-3.5 text-brand-500" /> "Wellness retreat in Thailand, 5 days"</span>
              </div>
            </div>
          ) : (
            <>
              {/* Itinerary header */}
              <div className="mb-8">
                <div className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-2">
                  {itinerary.status === 'draft' ? '· Draft' : '· Published'}
                </div>
                <h1 className="text-3xl font-bold text-notion-text mb-3 leading-tight">
                  {itinerary.title || itinerary.destination}
                </h1>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {itinerary.destination && (
                    <span className="flex items-center gap-1.5 text-xs bg-notion-hover text-notion-secondary px-2.5 py-1 rounded-full">
                      <Globe className="w-3 h-3" /> {itinerary.destination}
                    </span>
                  )}
                  {itinerary.duration && (
                    <span className="flex items-center gap-1.5 text-xs bg-notion-hover text-notion-secondary px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> {itinerary.duration} days
                    </span>
                  )}
                  {itinerary.travelers && (
                    <span className="flex items-center gap-1.5 text-xs bg-notion-hover text-notion-secondary px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" /> {itinerary.travelers} travelers
                    </span>
                  )}
                  {itinerary.budget && (
                    <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-3 h-3" /> {itinerary.budget}
                    </span>
                  )}
                  {itinerary.style && (
                    <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full capitalize font-medium">
                      {itinerary.style}
                    </span>
                  )}
                </div>

                {/* Publish button */}
                {itineraryId && !published && (
                  <button
                    onClick={handlePublish}
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {saving ? 'Publishing...' : 'Publish Itinerary'}
                  </button>
                )}

                {published && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Published! Redirecting...
                  </div>
                )}
              </div>

              {/* Day blocks */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-notion-secondary uppercase tracking-wider mb-4">
                  Day-by-Day Itinerary
                </h2>
                {itinerary.days?.map((day: any, i: number) => (
                  <ItineraryBlock key={i} day={day} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Chat Panel */}
      <div className="w-[360px] shrink-0">
        <ChatPanel
          itineraryId={itineraryId}
          currentItinerary={itinerary}
          onItineraryUpdate={handleItineraryUpdate}
          onOperatorSuggestion={handleOperatorSuggestion}
        />
      </div>
    </div>
  )
}
