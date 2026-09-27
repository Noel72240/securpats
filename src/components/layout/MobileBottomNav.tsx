import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dog, AlertTriangle, MessageSquare, Menu,
  Briefcase, Calendar, Settings, Heart, ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'owner' | 'petsitter' | 'admin' | 'foster' | 'volunteer'

type Tab = {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match?: (path: string) => boolean
}

function tabsFor(variant: Variant): Tab[] {
  if (variant === 'owner') {
    return [
      { to: '/app', label: 'Accueil', icon: LayoutDashboard, match: p => p === '/app' },
      { to: '/app/animaux', label: 'Animaux', icon: Dog, match: p => p.startsWith('/app/animaux') },
      { to: '/boutique', label: 'Boutique', icon: ShoppingBag, match: p => p.startsWith('/boutique') },
      { to: '/app/urgence', label: 'Urgence', icon: AlertTriangle, match: p => p.startsWith('/app/urgence') },
    ]
  }
  if (variant === 'petsitter') {
    return [
      { to: '/pet-sitter', label: 'Accueil', icon: LayoutDashboard, match: p => p === '/pet-sitter' },
      { to: '/pet-sitter/missions', label: 'Missions', icon: Briefcase, match: p => p.startsWith('/pet-sitter/missions') },
      { to: '/boutique', label: 'Boutique', icon: ShoppingBag, match: p => p.startsWith('/boutique') },
      { to: '/pet-sitter/disponibilites', label: 'Dispos', icon: Calendar, match: p => p.startsWith('/pet-sitter/disponibilites') },
    ]
  }
  if (variant === 'foster' || variant === 'volunteer') {
    return [
      { to: '/aidant', label: 'Accueil', icon: LayoutDashboard, match: p => p === '/aidant' },
      { to: '/aidant/disponibilites', label: 'Dispos', icon: Calendar, match: p => p.startsWith('/aidant/disponibilites') },
      { to: '/boutique', label: 'Boutique', icon: ShoppingBag, match: p => p.startsWith('/boutique') },
      { to: '/aidant/profil', label: 'Profil', icon: Settings, match: p => p.startsWith('/aidant/profil') },
    ]
  }
  // admin — minimal
  return [
    { to: '/admin', label: 'Accueil', icon: LayoutDashboard, match: p => p === '/admin' },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare, match: p => p.startsWith('/admin/messages') },
    { to: '/admin/aidants', label: 'Aidants', icon: Heart, match: p => p.startsWith('/admin/aidants') },
  ]
}

const accentActive: Record<Variant, string> = {
  owner: 'text-brand-700',
  petsitter: 'text-blue-700',
  foster: 'text-teal-700',
  volunteer: 'text-amber-700',
  admin: 'text-purple-700',
}

export function MobileBottomNav({
  variant,
  onMore,
  unreadCount = 0,
}: {
  variant: Variant
  onMore: () => void
  unreadCount?: number
}) {
  const location = useLocation()
  const tabs = tabsFor(variant)
  const activeClass = accentActive[variant]

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const active = tab.match
            ? tab.match(location.pathname)
            : location.pathname === tab.to
          const isMessages = tab.to.includes('/messages')
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold min-w-0',
                active ? activeClass : 'text-slate-500',
              )}
            >
              <span className="relative">
                <tab.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </span>
              <span className="truncate max-w-[4.5rem]">{tab.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-500"
        >
          <Menu className="w-5 h-5" />
          <span>Plus</span>
        </button>
      </div>
    </nav>
  )
}
