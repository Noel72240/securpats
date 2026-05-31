import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Dog, Users, FileText, QrCode, CreditCard,
  AlertTriangle, LogOut, Menu, X, ChevronLeft, Shield, Calendar, Briefcase,
  BarChart3, Settings, Globe, Lock,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'
import { PawDecorations } from '@/components/decor/PawDecorations'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const ownerNav: NavItem[] = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/app/animaux', label: 'Mes animaux', icon: Dog },
  { to: '/app/referents', label: 'Référents', icon: Users },
  { to: '/app/documents', label: 'Documents', icon: FileText },
  { to: '/app/qr-code', label: 'QR Code', icon: QrCode },
  { to: '/app/carte-urgence', label: 'Carte d\'urgence', icon: CreditCard },
  { to: '/app/urgence', label: 'Déclarer urgence', icon: AlertTriangle },
  { to: '/app/abonnement', label: 'Abonnement', icon: CreditCard },
  { to: '/app/donnees-personnelles', label: 'Mes données', icon: Lock },
]

const petsitterNav: NavItem[] = [
  { to: '/pet-sitter', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/pet-sitter/missions', label: 'Missions', icon: Briefcase },
  { to: '/pet-sitter/disponibilites', label: 'Disponibilités', icon: Calendar },
  { to: '/pet-sitter/profil', label: 'Mon profil', icon: Settings },
]

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/contenu-site', label: 'Contenu du site', icon: Globe },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/animaux', label: 'Animaux', icon: Dog },
  { to: '/admin/referents', label: 'Référents', icon: Users },
  { to: '/admin/pet-sitters', label: 'Pet-Sitters', icon: Shield },
  { to: '/admin/documents', label: 'Documents', icon: FileText },
  { to: '/admin/missions', label: 'Missions', icon: Briefcase },
  { to: '/admin/abonnements', label: 'Abonnements', icon: CreditCard },
  { to: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  variant: 'owner' | 'petsitter' | 'admin'
  title?: string
}

export function DashboardLayout({ children, variant, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useApp()

  const nav = variant === 'owner' ? ownerNav : variant === 'petsitter' ? petsitterNav : adminNav
  const accentColor = variant === 'admin' ? 'purple' : variant === 'petsitter' ? 'blue' : 'brand'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const colorClasses = {
    brand: { active: 'bg-brand-600 text-white', hover: 'hover:bg-brand-50 hover:text-brand-700', logo: 'bg-brand-600' },
    blue: { active: 'bg-blue-600 text-white', hover: 'hover:bg-blue-50 hover:text-blue-700', logo: 'bg-blue-600' },
    purple: { active: 'bg-purple-600 text-white', hover: 'hover:bg-purple-50 hover:text-purple-700', logo: 'bg-purple-600' },
  }[accentColor]

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <BrandLogo variant="icon" showText={false} imageClassName="h-12 w-12 sm:h-14 sm:w-14" />
        <p className="text-xs text-slate-500 capitalize mt-2 pl-0.5">
          {variant === 'owner' ? 'Espace propriétaire' : variant === 'petsitter' ? 'Espace Pet-Sitter' : 'Administration'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/app' && item.to !== '/admin' && item.to !== '/pet-sitter' && location.pathname.startsWith(item.to))
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
              <item.icon className="w-5 h-5" />
              {item.label}
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
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      <PawDecorations />
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
      <div className="flex-1 lg:ml-72 relative z-10">
        <div className="sticky top-0 z-20">
          <MaintenanceBanner />
          <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : null}
            </button>
          </div>
        </header>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
