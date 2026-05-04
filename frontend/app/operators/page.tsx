'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getOperators } from '@/lib/api'
import {
  Mountain, Compass, Map, Tent, Bike, Waves, Shield, SlidersHorizontal,
  ChevronDown, Star, CheckCircle, AlertCircle, Heart, X, ChevronRight,
  ChevronLeft, Search, Users, Calendar, ArrowRight, BadgeCheck
} from 'lucide-react'
import clsx from 'clsx'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Package {
  id: string
  name: string
  duration: number
  price_per_day: number
  total_price: number
  difficulty: string
  max_group: number
  type: string
  refundable: boolean
  deposit_required: boolean
  featured: boolean
  includes: string[]
  excludes: string[]
  cancellation_policy: string
  daily_breakdown: { label: string; price: number }[]
  taxes_fees: number
  discount_label: string
}

interface Operator {
  id: string
  name: string
  destinations: string[]
  styles: string[]
  hotel_rating: number
  price_per_day: number
  location: string
  verified: boolean
  featured: boolean
  rating: number
  reviews: number
  bookings: number
  specialties: string[]
  description: string
  telegram_handle: string
  image_color: string
  cover_image?: string
  packages: Package[]
}

// ── Category tabs ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', icon: Compass, label: 'All Treks' },
  { id: 'multi-day', icon: Map, label: 'Multi-day Treks' },
  { id: 'day-hike', icon: Mountain, label: 'Day Hikes' },
  { id: 'expedition', icon: Tent, label: 'Expeditions' },
  { id: 'cycling', icon: Bike, label: 'Cycling' },
  { id: 'water', icon: Waves, label: 'Kayak & Raft' },
  { id: 'private', icon: Shield, label: 'Private Tours' },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-green-600 bg-green-50',
  Moderate: 'text-amber-600 bg-amber-50',
  Strenuous: 'text-red-600 bg-red-50',
}

// ── Package row (one per package inside an operator card) ─────────────────────
function PackageRow({
  pkg,
  operatorName,
  onSelect,
}: {
  pkg: Package
  operatorName: string
  onSelect: (pkg: Package, opName: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(pkg, operatorName)}
      className="w-full text-left border-t border-warm-border px-5 py-3.5 hover:bg-warm-bg transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: name + tags */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-warm-text text-sm mb-1.5 group-hover:text-brand-600 transition-colors">
            {pkg.name}
            {pkg.featured && (
              <span className="ml-2 text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                Popular
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Operator source */}
            <span className="text-xs border border-warm-border rounded-full px-2 py-0.5 text-warm-secondary">
              {operatorName.split(' ')[0]}
            </span>
            {/* Payment */}
            {pkg.deposit_required ? (
              <span className="text-xs border border-warm-border rounded-full px-2 py-0.5 text-warm-secondary">
                Deposit Required
              </span>
            ) : (
              <span className="text-xs border border-warm-border rounded-full px-2 py-0.5 text-warm-secondary">
                Pay Later
              </span>
            )}
            {/* Refundable */}
            {pkg.refundable ? (
              <span className="text-xs text-[#2d9a6e] font-medium">Refundable</span>
            ) : (
              <span className="text-xs text-warm-muted">Non-refundable</span>
            )}
            {/* Type */}
            <span className="text-xs text-brand-600 font-medium">{pkg.type} Tour</span>
            {/* Difficulty */}
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', DIFFICULTY_COLORS[pkg.difficulty] || 'text-warm-muted bg-warm-cream')}>
              {pkg.difficulty}
            </span>
            {/* Discount / label */}
            {pkg.discount_label && (
              <span className="text-xs text-brand-500 font-medium flex items-center gap-0.5">
                <BadgeCheck className="w-3 h-3" /> {pkg.discount_label}
              </span>
            )}
          </div>
        </div>

        {/* Right: price */}
        <div className="text-right shrink-0">
          <div className="text-warm-secondary text-xs mb-0.5">
            ${pkg.price_per_day}
            <span className="text-[11px]"> avg/day</span>
          </div>
          <div className="font-semibold text-warm-text text-sm">
            ${pkg.total_price.toLocaleString()}
          </div>
          <div className="text-[11px] text-warm-muted">
            Total · {pkg.duration} days
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Operator card ─────────────────────────────────────────────────────────────
function OperatorCard({
  operator,
  onSelectPackage,
  onFavorite,
  isFavorited,
}: {
  operator: Operator
  onSelectPackage: (pkg: Package, opName: string) => void
  onFavorite: (id: string) => void
  isFavorited: boolean
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-warm-card rounded-xl border border-warm-border shadow-card overflow-hidden mb-4">
      <div className="flex">
        {/* Image area */}
        <div className={clsx('w-[260px] shrink-0 relative overflow-hidden', operator.image_color, 'min-h-[160px]')}>
          {operator.cover_image && (
            <img
              src={operator.cover_image}
              alt={`${operator.name} operator`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          <button
            onClick={() => onFavorite(operator.id)}
            className={clsx(
              'absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors',
              isFavorited ? 'bg-red-50 text-red-500' : 'bg-white/80 text-warm-secondary hover:text-red-400'
            )}
          >
            <Heart className={clsx('w-3.5 h-3.5', isFavorited && 'fill-red-400')} />
          </button>

          {/* Fallback marker when an operator has no cover image */}
          {!operator.cover_image && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <Mountain className="w-16 h-16 text-warm-text" />
            </div>
          )}

          {/* Badges at bottom */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
            {operator.featured && (
              <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                Featured Operator
              </span>
            )}
            {operator.verified && (
              <span className="text-[10px] bg-white/90 text-warm-text px-2 py-0.5 rounded font-semibold uppercase tracking-wide flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-brand-600" /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-warm-text text-base leading-tight mb-0.5">
                  {operator.name}
                </h3>
                <p className="text-xs text-warm-secondary mb-2">
                  {operator.location} · {operator.destinations.slice(0, 3).join(', ')}
                </p>

                {/* Ratings row */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={clsx(
                        'w-3 h-3',
                        s <= Math.floor(operator.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-warm-border fill-warm-border'
                      )} />
                    ))}
                    <span className="ml-0.5 font-medium text-warm-text">{operator.rating}</span>
                    <span className="text-warm-muted">({operator.reviews} reviews)</span>
                  </div>

                  {/* Bookings */}
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    Booked {operator.bookings}x
                  </span>

                  {/* Specialties preview */}
                  <span className="text-warm-muted truncate max-w-[200px]">
                    {operator.specialties.slice(0, 2).join(' · ')}
                  </span>
                </div>
              </div>

              {/* Toggle packages */}
              <button
                onClick={() => setExpanded(p => !p)}
                className="shrink-0 text-xs text-warm-secondary hover:text-warm-text flex items-center gap-1 transition-colors mt-1"
              >
                {expanded ? 'Hide' : `${operator.packages.length} packages`}
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Package rows */}
          {expanded && (
            <div>
              {operator.packages.map(pkg => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  operatorName={operator.name}
                  onSelect={onSelectPackage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Right detail panel ────────────────────────────────────────────────────────
function DetailPanel({
  pkg,
  operatorName,
  onClose,
  onContact,
}: {
  pkg: Package
  operatorName: string
  onClose: () => void
  onContact: () => void
}) {
  const subtotal = pkg.price_per_day * pkg.duration
  const total = subtotal + pkg.taxes_fees

  return (
    <div className="w-[340px] shrink-0 border-l border-warm-border bg-white flex flex-col animate-slide-left overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-warm-border px-5 py-3.5 flex items-center justify-between z-10">
        <span className="font-semibold text-sm text-warm-text">{operatorName}</span>
        <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-warm-bg flex items-center justify-center text-warm-secondary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Package name */}
        <div>
          <h3 className="font-semibold text-warm-text text-base mb-1">{pkg.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', DIFFICULTY_COLORS[pkg.difficulty] || '')}>
              {pkg.difficulty}
            </span>
            <span className="text-xs bg-warm-cream text-warm-secondary px-2 py-0.5 rounded-full">
              {pkg.type} · Max {pkg.max_group} pax
            </span>
          </div>
        </div>

        {/* Cancellation policy */}
        <div>
          <div className="text-xs font-semibold text-warm-text mb-1">Cancellation policy</div>
          <div className={clsx('text-xs font-medium mb-1', pkg.refundable ? 'text-[#2d9a6e]' : 'text-red-500')}>
            {pkg.refundable ? `Refundable — ${pkg.cancellation_policy.split(' until ')[1] || 'see terms'}` : 'Non-refundable'}
          </div>
          <p className="text-xs text-warm-secondary leading-relaxed">{pkg.cancellation_policy}</p>
        </div>

        {/* Daily breakdown */}
        <div>
          <div className="text-xs font-semibold text-warm-text mb-2">Daily rate breakdown</div>
          <div className="space-y-1.5">
            {pkg.daily_breakdown.map((row, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-warm-secondary">{row.label}</span>
                <span className="font-medium text-warm-text">${row.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div>
          <div className="text-xs font-semibold text-warm-text mb-2">Included</div>
          <ul className="space-y-1">
            {pkg.includes.map((inc, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-warm-secondary">
                <CheckCircle className="w-3 h-3 text-brand-500 shrink-0 mt-0.5" />
                {inc}
              </li>
            ))}
          </ul>
          {pkg.excludes.length > 0 && (
            <ul className="space-y-1 mt-2">
              {pkg.excludes.map((exc, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-warm-muted">
                  <X className="w-3 h-3 shrink-0 mt-0.5" />
                  {exc}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Price details */}
        <div className="border border-warm-border rounded-xl overflow-hidden">
          <div className="text-xs font-semibold text-warm-text px-4 py-2.5 bg-warm-bg border-b border-warm-border">
            Price details
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-xs text-warm-secondary">
              <span>{pkg.duration} days × ${pkg.price_per_day}/day</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-warm-secondary">
              <span>Taxes & Fees</span>
              <span>${pkg.taxes_fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-warm-text border-t border-warm-border pt-2 mt-1">
              <span>Total USD</span>
              <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Charge notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[9px] font-bold">i</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            A deposit of <strong>${(total * 0.3).toFixed(2)}</strong> will be charged at booking. Remainder due 30 days before departure.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold text-warm-text mb-1">Due at booking</div>
          <div className="text-lg font-bold text-warm-text">${(total * 0.3).toFixed(2)}</div>
        </div>

        {/* CTA */}
        <button
          onClick={onContact}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
        >
          Contact & Negotiate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OperatorsPage() {
  const router = useRouter()
  const [operators, setOperators] = useState<Operator[]>([])
  const [filtered, setFiltered] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedPkg, setSelectedPkg] = useState<{ pkg: Package; opName: string } | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState('recommended')
  const [searchWhere, setSearchWhere] = useState('')
  const [searchWhen, setSearchWhen] = useState('')
  const [searchWho, setSearchWho] = useState('2 hikers')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  useEffect(() => {
    getOperators().then(data => {
      setOperators(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = [...operators]

    if (searchWhere) {
      const q = searchWhere.toLowerCase()
      result = result.filter(op =>
        op.destinations.some(d => d.toLowerCase().includes(q)) ||
        op.name.toLowerCase().includes(q) ||
        op.location.toLowerCase().includes(q)
      )
    }

    if (showFeaturedOnly) result = result.filter(op => op.featured)

    if (activeCategory !== 'all') {
      if (activeCategory === 'private') result = result.filter(op => op.packages.some(p => p.type === 'Private'))
      else if (activeCategory === 'multi-day') result = result.filter(op => op.packages.some(p => p.duration > 3))
      else if (activeCategory === 'day-hike') result = result.filter(op => op.packages.some(p => p.duration === 1))
      else if (activeCategory === 'expedition') result = result.filter(op => op.packages.some(p => p.difficulty === 'Strenuous'))
    }

    if (sort === 'price-low') result.sort((a, b) => a.price_per_day - b.price_per_day)
    else if (sort === 'price-high') result.sort((a, b) => b.price_per_day - a.price_per_day)
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    else if (sort === 'bookings') result.sort((a, b) => b.bookings - a.bookings)

    setFiltered(result)
  }, [operators, searchWhere, showFeaturedOnly, activeCategory, sort])

  const totalPackages = filtered.reduce((n, op) => n + op.packages.length, 0)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main scroll area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-warm-text">Hiking Operators</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFeaturedOnly(p => !p)}
                className={clsx(
                  'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors',
                  showFeaturedOnly
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-warm-border text-warm-secondary hover:border-brand-400'
                )}
              >
                <Heart className={clsx('w-3.5 h-3.5', showFeaturedOnly && 'fill-white')} />
                Featured Partners
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-0.5 border-b border-warm-border mb-5 overflow-x-auto pb-0">
            {CATEGORIES.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors relative shrink-0',
                  activeCategory === id
                    ? 'text-warm-text border-b-2 border-warm-text pb-[6px]'
                    : 'text-warm-secondary hover:text-warm-text pb-2'
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-0 bg-white rounded-2xl border border-warm-border shadow-card mb-5 overflow-hidden">
            <div className="flex-1 px-5 py-3 border-r border-warm-border">
              <div className="text-[10px] text-warm-muted font-semibold uppercase tracking-wider mb-0.5">Where</div>
              <input
                type="text"
                value={searchWhere}
                onChange={e => setSearchWhere(e.target.value)}
                placeholder="Destination or operator"
                className="w-full text-sm text-warm-text placeholder:text-warm-muted outline-none bg-transparent"
              />
            </div>
            <div className="px-5 py-3 border-r border-warm-border min-w-[180px]">
              <div className="text-[10px] text-warm-muted font-semibold uppercase tracking-wider mb-0.5">When</div>
              <input
                type="text"
                value={searchWhen}
                onChange={e => setSearchWhen(e.target.value)}
                placeholder="Add dates"
                className="w-full text-sm text-warm-text placeholder:text-warm-muted outline-none bg-transparent"
              />
            </div>
            <div className="px-5 py-3 flex-1">
              <div className="text-[10px] text-warm-muted font-semibold uppercase tracking-wider mb-0.5">Who</div>
              <input
                type="text"
                value={searchWho}
                onChange={e => setSearchWho(e.target.value)}
                className="w-full text-sm text-warm-text outline-none bg-transparent"
              />
            </div>
            <button className="m-2 w-10 h-10 rounded-xl bg-warm-text flex items-center justify-center hover:bg-warm-secondary transition-colors shrink-0">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Filters + sort row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm border border-warm-border rounded-full px-3 py-1.5 hover:border-warm-secondary transition-colors text-warm-secondary">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(p => !p)}
                  className="flex items-center gap-1.5 text-sm border border-warm-border rounded-full px-3 py-1.5 hover:border-warm-secondary transition-colors text-warm-secondary"
                >
                  Sort <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {sortOpen && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-warm-border rounded-xl shadow-panel z-20 min-w-[160px] py-1 animate-fade-in">
                    {[
                      { id: 'recommended', label: 'Recommended' },
                      { id: 'rating', label: 'Highest rated' },
                      { id: 'bookings', label: 'Most booked' },
                      { id: 'price-low', label: 'Price: low to high' },
                      { id: 'price-high', label: 'Price: high to low' },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSort(s.id); setSortOpen(false) }}
                        className={clsx(
                          'w-full text-left px-3.5 py-2 text-sm hover:bg-warm-bg transition-colors',
                          sort === s.id ? 'text-brand-600 font-medium' : 'text-warm-secondary'
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-warm-secondary">
              <span className="font-medium text-warm-text">{totalPackages}</span> packages across{' '}
              <span className="font-medium text-warm-text">{filtered.length}</span> operators
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-warm-cream rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Mountain className="w-10 h-10 text-warm-muted mx-auto mb-3" />
              <p className="text-warm-secondary">No operators match your search</p>
            </div>
          ) : (
            filtered.map(op => (
              <OperatorCard
                key={op.id}
                operator={op}
                onSelectPackage={(pkg, opName) => setSelectedPkg({ pkg, opName })}
                onFavorite={id => setFavorites(prev => {
                  const n = new Set(prev)
                  n.has(id) ? n.delete(id) : n.add(id)
                  return n
                })}
                isFavorited={favorites.has(op.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right detail panel */}
      {selectedPkg && (
        <DetailPanel
          pkg={selectedPkg.pkg}
          operatorName={selectedPkg.opName}
          onClose={() => setSelectedPkg(null)}
          onContact={() => {
            const op = operators.find(o => o.name === selectedPkg.opName)
            if (op) router.push(`/negotiations?operator=${op.id}`)
            setSelectedPkg(null)
          }}
        />
      )}
    </div>
  )
}
