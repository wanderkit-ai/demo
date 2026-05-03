'use client'
import { MapPin, Utensils, Home, Lightbulb, DollarSign, Clock } from 'lucide-react'

interface Day {
  day: number
  title: string
  location: string
  activities: string[]
  accommodation: string
  meals?: string
  notes?: string
  estimated_cost?: string
}

interface ItineraryBlockProps {
  day: Day
  isNew?: boolean
}

export default function ItineraryBlock({ day, isNew }: ItineraryBlockProps) {
  return (
    <div className={`day-block border border-notion-border rounded-xl p-5 mb-3 ${isNew ? 'ring-2 ring-brand-300 ring-offset-1' : ''}`}>
      {/* Day header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {day.day}
          </div>
          <div>
            <h3 className="font-semibold text-notion-text text-sm leading-tight">{day.title}</h3>
            <div className="flex items-center gap-1 text-xs text-notion-muted mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{day.location}</span>
            </div>
          </div>
        </div>
        {day.estimated_cost && (
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
            <DollarSign className="w-3 h-3" />
            {day.estimated_cost}
          </div>
        )}
      </div>

      {/* Activities */}
      {day.activities && day.activities.length > 0 && (
        <div className="mb-3">
          <ul className="space-y-1.5">
            {day.activities.map((act, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-notion-text">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer metadata */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-notion-border">
        {day.accommodation && (
          <div className="flex items-center gap-1.5 text-xs text-notion-secondary">
            <Home className="w-3 h-3 text-brand-500" />
            <span>{day.accommodation}</span>
          </div>
        )}
        {day.meals && (
          <div className="flex items-center gap-1.5 text-xs text-notion-secondary">
            <Utensils className="w-3 h-3 text-amber-500" />
            <span>{day.meals}</span>
          </div>
        )}
        {day.notes && (
          <div className="flex items-center gap-1.5 text-xs text-notion-secondary">
            <Lightbulb className="w-3 h-3 text-purple-500" />
            <span>{day.notes}</span>
          </div>
        )}
      </div>
    </div>
  )
}
