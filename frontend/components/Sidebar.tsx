'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Mountain, MessageSquare, CheckSquare, Map, Plane } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-[220px] h-full flex flex-col pt-4 px-3 border-r border-warm-border shrink-0 bg-warm-bg">
      <div className="mb-4 px-2">
        <div className="text-xs font-semibold text-warm-text">Navigation</div>
        <div className="text-[11px] text-warm-muted">Demo-ready workspace</div>
      </div>

      {/* Book travel */}
      <Section title="Book Travel">
        <SideItem href="/operators" icon={Mountain} label="Hiking Operators" active={path.startsWith('/operators') || path.startsWith('/itinerary')} />
      </Section>

      {/* Manage */}
      <Section title="Manage">
        <SideItem href="/negotiations" icon={MessageSquare} label="Negotiations" active={path.startsWith('/negotiations')} />
        <SideItem href="/bookings" icon={CheckSquare} label="Bookings" active={path.startsWith('/bookings')} />
      </Section>

      {/* Trips */}
      <Section title="Trips">
        <SideItem href="/itinerary/new" icon={Map} label="Create Trip" active={path === '/itinerary/new'} />
        <SideItem href="/bookings" icon={Plane} label="Trip" active={path.startsWith('/trip') || path.startsWith('/bookings')} />
      </Section>

      {/* Browse */}
      <Section title="Browse">
        <SideItem href="/" icon={LayoutGrid} label="Dashboard" active={path === '/'} />
      </Section>
    </aside>
  )
}

function SideItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm mb-1 transition-colors border',
        active
          ? 'bg-warm-cream border-brand-200 text-warm-text font-semibold shadow-sm'
          : 'border-transparent text-warm-secondary hover:bg-warm-hover hover:text-warm-text'
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3 rounded-xl border border-warm-border bg-white/60 p-2">
      <div className="text-[10px] text-warm-muted uppercase tracking-widest font-semibold px-1.5 mb-1.5">
        {title}
      </div>
      {children}
    </div>
  )
}
