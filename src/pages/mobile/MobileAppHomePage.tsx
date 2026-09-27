import { Link, Navigate } from 'react-router-dom'
import { Dog, Heart, Shield, ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { homePathForRole } from '@/lib/caregiver/spaces'
import { isNativeApp } from '@/lib/platform'

const ROLES = [
  {
    to: '/connexion',
    title: 'Propriétaire',
    subtitle: 'Protégez vos animaux et gérez les urgences',
    icon: Dog,
    accent: 'bg-brand-600',
    soft: 'bg-brand-50 text-brand-800 border-brand-100',
  },
  {
    to: '/pet-sitter/connexion',
    title: 'Pet-sitter',
    subtitle: 'Missions, disponibilités et profil VIP',
    icon: Shield,
    accent: 'bg-blue-600',
    soft: 'bg-blue-50 text-blue-800 border-blue-100',
  },
  {
    to: '/aidant/connexion',
    title: 'Bénévole / Famille d’accueil',
    subtitle: 'Aidez les animaux en urgence',
    icon: Heart,
    accent: 'bg-teal-600',
    soft: 'bg-teal-50 text-teal-800 border-teal-100',
  },
] as const

/** Accueil dédié app mobile (Capacitor) — choix d’espace + redirection si connecté. */
export default function MobileAppHomePage() {
  const { currentUser, authLoading } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to={homePathForRole(currentUser.role)} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-slate-50 flex flex-col px-5 pt-10 pb-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SécurPats</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-xs">
          Protection animale d’urgence — choisissez votre espace
        </p>
      </div>

      <div className="flex-1 space-y-3 max-w-md mx-auto w-full">
        {ROLES.map(role => (
          <Link
            key={role.to}
            to={role.to}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${role.soft} active:scale-[0.98] transition-transform`}
          >
            <span className={`w-12 h-12 rounded-xl ${role.accent} text-white flex items-center justify-center shrink-0`}>
              <role.icon className="w-6 h-6" />
            </span>
            <span className="flex-1 text-left min-w-0">
              <span className="block font-semibold text-base">{role.title}</span>
              <span className="block text-xs opacity-80 mt-0.5">{role.subtitle}</span>
            </span>
            <ArrowRight className="w-5 h-5 opacity-50 shrink-0" />
          </Link>
        ))}

        <Link
          to="/boutique"
          className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-amber-50 text-amber-900 border-amber-100 active:scale-[0.98] transition-transform"
        >
          <span className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </span>
          <span className="flex-1 text-left min-w-0">
            <span className="block font-semibold text-base">Boutique</span>
            <span className="block text-xs opacity-80 mt-0.5">Médailles, QR et accessoires SécurPats</span>
          </span>
          <ArrowRight className="w-5 h-5 opacity-50 shrink-0" />
        </Link>
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-xs text-slate-500">Pas encore de compte ?</p>
        <div className="flex flex-col gap-2 text-sm font-medium">
          <Link to="/inscription" className="text-brand-700">Créer un compte propriétaire</Link>
          <Link to="/pet-sitter/inscription" className="text-blue-700">Devenir pet-sitter</Link>
          <Link to="/aidant/inscription" className="text-teal-700">Devenir aidant</Link>
        </div>
        {!isNativeApp() && (
          <Link to="/?web=1" className="inline-block mt-4 text-xs text-slate-400 underline">
            Voir le site web
          </Link>
        )}
      </div>
    </div>
  )
}
