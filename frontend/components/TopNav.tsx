'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Settings, GraduationCap, Bell, HelpCircle, Globe } from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/operators', icon: BookOpen, label: 'Book' },
  { href: '/negotiations', icon: Settings, label: 'Manage' },
  { href: '/bookings', icon: GraduationCap, label: 'Learn' },
]

export default function TopNav() {
  const path = usePathname()

  const activeTab = tabs.find(t =>
    t.href === '/' ? path === '/' : path.startsWith(t.href)
  ) || tabs[0]

  return (
    <header className="h-[60px] bg-warm-cream border-b border-warm-border flex items-center px-6 gap-4 shrink-0 z-20 relative">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-6">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <span className="font-bold text-warm-text tracking-tight text-base">WanderKit</span>
      </Link>

      {/* Nav tabs — centered */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-warm-text shadow-sm'
                  : 'text-warm-secondary hover:text-warm-text hover:bg-warm-hover'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right icons */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-hover transition-colors text-warm-secondary">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-warm-hover transition-colors text-warm-secondary">
          <HelpCircle className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
          A
        </div>
      </div>
    </header>
  )
}
