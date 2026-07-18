import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Dog, Users, FileText, QrCode, CreditCard,
  AlertTriangle, LogOut, Menu, X, ChevronLeft, Shield, Calendar, Briefcase,
  BarChart3, Settings, Globe, Lock, IdCard, Wrench, ShoppingBag, Newspaper, Handshake, ScrollText,
  MessageSquare,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'
import { useSupportUnreadCount } from '@/hooks/useSupportUnreadCount'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useI18n } from '@/i18n/LanguageContext'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface DashboardLayoutProps {
  children: React.ReactNode
  variant: 'owner' | 'petsitter' | 'admin' | 'foster' | 'volunteer'
  title?: string
}

export function DashboardLayout({ children, variant, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useApp()
  const { t } = useI18n()

  const ownerNav: NavItem[] = useMemo(() => [
    { to: '/app', label: t('dash.dashboard'), icon: LayoutDashboard },
    { to: '/app/animaux', label: t('dash.myPets'), icon: Dog },
    { to: '/app/referents', label: t('dash.referents'), icon: Users },
    { to: '/app/documents', label: t('dash.documents'), icon: FileText },
    { to: '/app/directives', label: t('dash.directives'), icon: ScrollText },
    { to: '/app/messages', label: t('dash.messages'), icon: MessageSquare },
    { to: '/app/qr-code', label: t('dash.qrCode'), icon: QrCode },
    { to: '/app/carte-urgence', label: t('dash.emergencyCard'), icon: CreditCard },
    { to: '/app/urgence', label: t('dash.declareEmergency'), icon: AlertTriangle },
    { to: '/app/pet-sitters', label: t('dash.findPetsitter'), icon: Shield },
    { to: '/app/missions', label: t('dash.myEmergencies'), icon: Briefcase },
    { to: '/app/abonnement', label: t('dash.subscription'), icon: CreditCard },
    { to: '/app/profil', label: t('dash.identity'), icon: IdCard },
    { to: '/app/donnees-personnelles', label: t('dash.myData'), icon: Lock },
  ], [t])

  const petsitterNav: NavItem[] = useMemo(() => [
    { to: '/pet-sitter', label: t('dash.dashboard'), icon: LayoutDashboard },
    { to: '/pet-sitter/missions', label: t('dash.missions'), icon: Briefcase },
    { to: '/pet-sitter/disponibilites', label: t('dash.availability'), icon: Calendar },
    { to: '/pet-sitter/messages', label: t('dash.messages'), icon: MessageSquare },
    { to: '/pet-sitter/profil', label: t('dash.myProfile'), icon: Settings },
    { to: '/pet-sitter/abonnement', label: t('dash.vipSub'), icon: CreditCard },
  ], [t])

  const fosterNav: NavItem[] = useMemo(() => [
    { to: '/famille-accueil', label: t('dash.dashboard'), icon: LayoutDashboard },
    { to: '/famille-accueil/disponibilites', label: t('dash.availability'), icon: Calendar },
    { to: '/famille-accueil/profil', label: t('dash.myProfile'), icon: Settings },
  ], [t])

  const volunteerNav: NavItem[] = useMemo(() => [
    { to: '/benevole', label: t('dash.dashboard'), icon: LayoutDashboard },
    { to: '/benevole/disponibilites', label: t('dash.availability'), icon: Calendar },
    { to: '/benevole/profil', label: t('dash.myProfile'), icon: Settings },
  ], [t])

  const adminNav: NavItem[] = useMemo(() => [
    { to: '/admin', label: t('dash.dashboard'), icon: LayoutDashboard },
    { to: '/admin/messages', label: t('dash.messages'), icon: MessageSquare },
    { to: '/admin/contenu-site?tab=maintenance', label: t('dash.maintenance'), icon: Wrench },
    { to: '/admin/contenu-site', label: t('dash.siteContent'), icon: Globe },
    { to: '/admin/boutique', label: t('dash.shop'), icon: ShoppingBag },
    { to: '/admin/actu', label: t('dash.news'), icon: Newspaper },
    { to: '/admin/partenaires', label: t('dash.partners'), icon: Handshake },
    { to: '/admin/utilisateurs', label: t('dash.users'), icon: Users },
    { to: '/admin/animaux', label: t('dash.pets'), icon: Dog },
    { to: '/admin/referents', label: t('dash.referents'), icon: Users },
    { to: '/admin/pet-sitters', label: t('dash.petsitters'), icon: Shield },
    { to: '/admin/documents', label: t('dash.documents'), icon: FileText },
    { to: '/admin/missions', label: t('dash.missions'), icon: Briefcase },
    { to: '/admin/abonnements', label: t('dash.subscriptions'), icon: CreditCard },
    { to: '/admin/statistiques', label: t('dash.stats'), icon: BarChart3 },
  ], [t])

  const nav =
    variant === 'owner' ? ownerNav
      : variant === 'petsitter' ? petsitterNav
        : variant === 'foster' ? fosterNav
          : variant === 'volunteer' ? volunteerNav
            : adminNav

  const accentColor =
    variant === 'admin' ? 'purple'
      : variant === 'petsitter' ? 'blue'
        : variant === 'foster' ? 'teal'
          : variant === 'volunteer' ? 'amber'
            : 'brand'

  const unreadCount = useSupportUnreadCount(Boolean(currentUser), variant === 'admin')
  const messagesPath =
    variant === 'admin' ? '/admin/messages' : variant === 'petsitter' ? '/pet-sitter/messages' : '/app/messages'

  const handleLogout = () => {
    logout()
    navigate(
      variant === 'petsitter' ? '/pet-sitter/connexion'
        : variant === 'foster' ? '/famille-accueil/connexion'
          : variant === 'volunteer' ? '/benevole/connexion'
            : variant === 'admin' ? '/admin/connexion'
              : '/connexion',
    )
  }

  const colorClasses = {
    brand: { active: 'bg-brand-600 text-white', hover: 'hover:bg-brand-50 hover:text-brand-700', logo: 'bg-brand-600' },
    blue: { active: 'bg-blue-600 text-white', hover: 'hover:bg-blue-50 hover:text-blue-700', logo: 'bg-blue-600' },
    purple: { active: 'bg-purple-600 text-white', hover: 'hover:bg-purple-50 hover:text-purple-700', logo: 'bg-purple-600' },
    teal: { active: 'bg-teal-600 text-white', hover: 'hover:bg-teal-50 hover:text-teal-700', logo: 'bg-teal-600' },
    amber: { active: 'bg-amber-600 text-white', hover: 'hover:bg-amber-50 hover:text-amber-700', logo: 'bg-amber-600' },
  }[accentColor]

  const spaceLabel =
    variant === 'owner' ? t('dash.ownerSpace')
      : variant === 'petsitter' ? t('dash.petsitterSpace')
        : variant === 'foster' ? t('dash.fosterSpace')
          : variant === 'volunteer' ? t('dash.volunteerSpace')
            : t('dash.adminSpace')

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <BrandLogo variant="icon" showText={false} imageClassName="h-12 w-12 sm:h-14 sm:w-14" />
        <p className="text-xs text-slate-500 capitalize mt-2 pl-0.5">
          {spaceLabel}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const [itemPath, itemQuery = ''] = item.to.split('?')
          let isActive: boolean
          if (itemQuery) {
            isActive = location.pathname === itemPath && location.search.includes(itemQuery)
          } else if (itemPath === '/admin/contenu-site') {
            isActive = location.pathname === itemPath && !location.search.includes('tab=maintenance')
          } else {
            isActive = location.pathname === item.to ||
              (item.to !== '/app' && item.to !== '/admin' && item.to !== '/pet-sitter'
                && item.to !== '/famille-accueil' && item.to !== '/benevole'
                && location.pathname.startsWith(itemPath))
          }
          const isMessages = item.to === messagesPath
          const showDot = isMessages && unreadCount > 0
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive ? colorClasses.active : cn('text-slate-600', colorClasses.hover)
              )}
            >
              <span className="relative shrink-0">
                <item.icon className="w-5 h-5" />
                {showDot && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"
                    aria-hidden
                  />
                )}
              </span>
              <span className="flex-1">{item.label}</span>
              {showDot && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        {currentUser && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('dash.logout')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-100 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl animate-slide-in-left">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-72">
        <div className="sticky top-0 z-20">
          <MaintenanceBanner />
          <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 relative"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" aria-hidden />
                )}
              </button>
              <Link to="/" className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {unreadCount > 0 && (
                <Link
                  to={messagesPath}
                  className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Nouveaux messages"
                  aria-label={`${unreadCount} message(s) non lu(s)`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                </Link>
              )}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : null}
              </button>
            </div>
          </div>
        </header>
        </div>
        <main className="p-3 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
