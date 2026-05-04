'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ItineraryBlock from '@/components/ItineraryBlock'
import OperatorCard from '@/components/OperatorCard'
import { getItinerary, publishItinerary, launchTrip } from '@/lib/api'
import {
  Globe, Clock, Users, DollarSign, ArrowLeft,
  AlertCircle, Map, Send, Check,
  ExternalLink, LayoutDashboard
} from 'lucide-react'

const styleColors: Record<string, string> = {
  luxury: 'bg-amber-50 text-amber-700',
  adventure: 'bg-green-50 text-green-700',
  cultural: 'bg-purple-50 text-purple-700',
  wellness: 'bg-blue-50 text-blue-700',
  budget: 'bg-gray-50 text-gray-600',
}

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [tripLaunched, setTripLaunched] = useState(false)

  useEffect(() => {
    getItinerary(params.id)
      .then(data => {
        setItinerary(data)
        if (data?.trip_launched) setTripLaunched(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handlePublish = async () => {
    if (!itinerary || itinerary.status === 'published') return
    setPublishing(true)
    const updated = await publishItinerary(params.id)
    setItinerary(updated)
    setPublished(true)
    setPublishing(false)
  }

  const handleLaunchTrip = async () => {
    setLaunching(true)
    await launchTrip(params.id)
    setTripLaunched(true)
    setLaunching(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-notion-hover rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-10 text-center">
        <AlertCircle className="w-8 h-8 text-notion-muted mx-auto mb-3" />
        <p className="text-notion-secondary">Itinerary not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-notion-secondary hover:text-notion-text mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Status + Publish */}
      <div className="flex items-center flex-wrap gap-2 mb-2">
        <div className="text-xs text-brand-600 font-semibold uppercase tracking-wider">
          {itinerary.status === 'published' ? '✓ Published' : '· Draft'}
        </div>
        {itinerary.status !== 'published' && !published && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 text-xs bg-brand-600 text-white px-3 py-1 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            <Send className="w-3 h-3" />
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        )}
        {(published || itinerary.status === 'published') && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Check className="w-3.5 h-3.5" /> Live
          </span>
        )}

        {/* Launch Trip Page — shown once published */}
        {(published || itinerary.status === 'published') && !tripLaunched && (
          <button
            onClick={handleLaunchTrip}
            disabled={launching}
            className="flex items-center gap-1.5 text-xs bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60"
          >
            <ExternalLink className="w-3 h-3" />
            {launching ? 'Launching...' : 'Launch Trip Page'}
          </button>
        )}

        {/* Manage Signups — shown once trip is launched */}
        {(tripLaunched || itinerary.trip_launched) && (
          <div className="flex items-center gap-2">
            <a
              href={`/trip/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs border border-amber-400 text-amber-700 px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Public Page
            </a>
            <button
              onClick={() => router.push(`/trip/${params.id}/manage`)}
              className="flex items-center gap-1.5 text-xs bg-brand-600 text-white px-3 py-1 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <LayoutDashboard className="w-3 h-3" /> Manage Signups
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-notion-text mb-4 leading-tight">
        {itinerary.title || itinerary.destination}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-8">
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
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${styleColors[itinerary.style] || 'bg-gray-50 text-gray-600'}`}>
            {itinerary.style}
          </span>
        )}
      </div>

      {/* Days */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-notion-secondary uppercase tracking-wider mb-4">
          {itinerary.days?.length || 0} Days · Day-by-Day Plan
        </h2>
        {itinerary.days?.length === 0 ? (
          <div className="border-2 border-dashed border-notion-border rounded-xl p-8 text-center">
            <Map className="w-6 h-6 text-notion-muted mx-auto mb-2" />
            <p className="text-sm text-notion-secondary">No days planned yet</p>
          </div>
        ) : (
          itinerary.days?.map((day: any, i: number) => (
            <ItineraryBlock key={i} day={day} />
          ))
        )}
      </div>

    </div>
  )
}
