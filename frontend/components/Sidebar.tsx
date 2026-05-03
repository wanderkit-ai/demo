'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Mountain, MessageSquare, CheckSquare, Map } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-[200px] h-full flex flex-col pt-5 px-3 border-r border-warm-border shrink-0 bg-warm-bg">
      {/* Book travel */}
      <div className="mb-5">
        <div className="text-[11px] text-warm-muted uppercase tracking-widest font-semibold px-2 mb-2">
          Book travel
        </div>
        <SideItem href="/operators" icon={Mountain} label="Hiking Operators" active={path.startsWith('/operators') || path.startsWith('/itinerary')} />
      </div>

      {/* Manage */}
      <div className="mb-5">
        <div className="text-[11px] text-warm-muted uppercase tracking-widest font-semibold px-2 mb-2">
          Manage
        </div>
        <SideItem href="/negotiations" icon={MessageSquare} label="Negotiations" active={path.startsWith('/negotiations')} />
        <SideItem href="/bookings" icon={CheckSquare} label="Bookings" active={path.startsWith('/bookings')} />
      </div>

      {/* Browse */}
      <div>
        <div className="text-[11px] text-warm-muted uppercase tracking-widest font-semibold px-2 mb-2">
          Browse
        </div>
        <SideItem href="/" icon={LayoutGrid} label="Dashboard" active={path === '/'} />
        <SideItem href="/itinerary/new" icon={Map} label="New Itinerary" active={path === '/itinerary/new'} />
      </div>
    </aside>
  )
}

function SideItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm mb-0.5 transition-colors',
        active
          ? 'bg-warm-cream text-warm-text font-medium'
          : 'text-warm-secondary hover:bg-warm-hover hover:text-warm-text'
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}
