'use client'
import { Star, MapPin, AlertCircle, Mountain } from 'lucide-react'

interface Operator {
  id: string
  name: string
  destinations: string[]
  styles: string[]
  hotel_rating: number
  price_per_day: number
  specialties: string[]
  description: string
  telegram_handle: string
  cover_image?: string
  match_score?: number
  constraint_note?: string
}

interface OperatorCardProps {
  operator: Operator
  onContact?: (op: Operator) => void
  showMatchScore?: boolean
}

const styleColor: Record<string, string> = {
  luxury: 'bg-amber-50 text-amber-700 border-amber-200',
  adventure: 'bg-green-50 text-green-700 border-green-200',
  cultural: 'bg-purple-50 text-purple-700 border-purple-200',
  wellness: 'bg-blue-50 text-blue-700 border-blue-200',
  budget: 'bg-gray-50 text-gray-600 border-gray-200',
  wildlife: 'bg-orange-50 text-orange-700 border-orange-200',
  trekking: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function OperatorCard({ operator, onContact, showMatchScore }: OperatorCardProps) {
  const stars = Math.round(operator.hotel_rating * 2) / 2

  return (
    <div className="bg-white border border-notion-border rounded-xl overflow-hidden hover:border-brand-200 hover:shadow-sm transition-all">
      <div className="relative h-36 bg-notion-hover">
        {operator.cover_image ? (
          <img
            src={operator.cover_image}
            alt={`${operator.name} operator`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Mountain className="w-10 h-10 text-notion-muted" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        {showMatchScore && operator.match_score && operator.match_score >= 60 && (
          <span className="absolute left-3 bottom-3 text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">
            Best Match
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-notion-text text-sm">{operator.name}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-notion-muted">
              <MapPin className="w-3 h-3" />
              <span>{operator.destinations.slice(0,2).join(', ')}</span>
            </div>
          </div>

          <div className="text-right shrink-0 ml-3">
            <div className="text-lg font-bold text-notion-text">${operator.price_per_day}</div>
            <div className="text-xs text-notion-muted">per day</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= Math.floor(stars) ? 'text-amber-400 fill-amber-400' : s - 0.5 <= stars ? 'text-amber-400 fill-amber-200' : 'text-notion-border fill-notion-border'}`}
              />
            ))}
          </div>
          <span className="text-xs text-notion-secondary font-medium">{operator.hotel_rating} stars</span>
        </div>

        {/* Description */}
        <p className="text-xs text-notion-secondary leading-relaxed mb-3 line-clamp-2">
          {operator.description}
        </p>

        {/* Style tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {operator.styles.map(s => (
            <span key={s} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styleColor[s] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {s}
            </span>
          ))}
        </div>

        {/* Specialties */}
        <div className="mb-3">
          <div className="text-xs text-notion-muted mb-1.5 font-medium">Specialties</div>
          <div className="flex flex-wrap gap-1">
            {operator.specialties.slice(0, 4).map(s => (
              <span key={s} className="text-xs bg-notion-hover text-notion-secondary px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Constraint note */}
        {operator.constraint_note && (
          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">{operator.constraint_note}</p>
          </div>
        )}

        {/* Telegram + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-notion-border">
          <div className="text-xs text-notion-muted font-mono">{operator.telegram_handle}</div>
          {onContact && (
            <button
              onClick={() => onContact(operator)}
              className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Contact & Negotiate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
