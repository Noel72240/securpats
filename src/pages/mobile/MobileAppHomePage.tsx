import { Link, Navigate } from 'react-router-dom'
import { Dog, Heart, Shield, ArrowRight, Loader2, ShoppingBag, Scale } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { homePathForRole } from '@/lib/caregiver/spaces'
import { isNativeApp } from '@/lib/platform'
import { HomeActuTeaser } from '@/components/home/HomeActuTeaser'
import { SubscribePitchSection } from '@/components/home/SubscribePitchSection'

const ROLES = [
  {
    to: '/connexion',
    title: 'Propriétaire',
    subtitle: 'Animaux, référents et alerte SOS',
    icon: Dog,
    accent: 'bg-brand-600',
    soft: 'bg-white text-brand-900 border-brand-100 shadow-sm shadow-brand-900/5',
  },
  {
    to: '/pet-sitter/connexion',
    title: 'Pet-sitter',
    subtitle: 'Missions, disponibilités et profil VIP',
    icon: Shield,
    accent: 'bg-brand-700',
    soft: 'bg-white text-brand-900 border-brand-100 shadow-sm shadow-brand-900/5',
  },
  {
    to: '/aidant/connexion',
    title: 'Bénévole / Famille d’accueil',
    subtitle: 'Aidez les animaux en urgence',
    icon: Heart,
    accent: 'bg-brand-800',
    soft: 'bg-white text-brand-900 border-brand-100 shadow-sm shadow-brand-900/5',
  },
] as const

/** Accueil dédié app mobile (Capacitor) — garde, marketing, actu, espaces. */
export default function MobileAppHomePage() {
  const { currentUser, authLoading } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to={homePathForRole(currentUser.role)} replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-emerald-50/40 flex flex-col">
      <div className="relative overflow-hidden px-5 pt-10 pb-6">
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
        <div className="absolute top-24 -left-16 w-40 h-40 rounded-full bg-accent-400/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-md mx-auto text-center">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-[11px] font-semibold uppercase tracking-[0.14em] mb-3">
            Protection animale d’urgence
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SécurPats</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Préparez la prise en charge de vos compagnons — et alertez vos proches en un geste.
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 max-w-md mx-auto w-full">
        <SubscribePitchSection compact />

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-[0.12em] mb-3 px-0.5">
            Choisir votre espace
          </h2>
          <div className="space-y-3">
            {ROLES.map(role => (
              <Link
                key={role.to}
                to={role.to}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${role.soft} active:scale-[0.98] transition-transform`}
              >
                <span className={`w-12 h-12 rounded-xl ${role.accent} text-white flex items-center justify-center shrink-0`}>
                  <role.icon className="w-6 h-6" />
                </span>
                <span className="flex-1 text-left min-w-0">
                  <span className="block font-semibold text-base">{role.title}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{role.subtitle}</span>
                </span>
                <ArrowRight className="w-5 h-5 text-brand-400 shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        <HomeActuTeaser compact limit={3} />

        <section className="mt-8 space-y-3">
          <Link
            to="/boutique"
            className="flex items-center gap-4 p-4 rounded-2xl border border-accent-200 bg-amber-50/80 text-amber-950 active:scale-[0.98] transition-transform"
          >
            <span className="w-12 h-12 rounded-xl bg-accent-500 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <span className="flex-1 text-left min-w-0">
              <span className="block font-semibold text-base">Boutique</span>
              <span className="block text-xs opacity-80 mt-0.5">Médailles, QR et accessoires</span>
            </span>
            <ArrowRight className="w-5 h-5 opacity-50 shrink-0" />
          </Link>

          <Link
            to="/informations-legales"
            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 active:scale-[0.98] transition-transform"
          >
            <span className="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </span>
            <span className="flex-1 text-left min-w-0">
              <span className="block font-semibold text-base">Informations légales</span>
              <span className="block text-xs text-slate-500 mt-0.5">CGU, confidentialité, RGPD</span>
            </span>
            <ArrowRight className="w-5 h-5 opacity-40 shrink-0" />
          </Link>
        </section>

        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-slate-500">Pas encore de compte ?</p>
          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link to="/inscription" className="text-brand-700">Créer un compte propriétaire</Link>
            <Link to="/pet-sitter/inscription" className="text-brand-800">Devenir pet-sitter</Link>
            <Link to="/aidant/inscription" className="text-brand-900">Devenir aidant</Link>
          </div>
          <div className="pt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <Link to="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <span aria-hidden>·</span>
            <Link to="/cgu" className="hover:underline">CGU</Link>
            <span aria-hidden>·</span>
            <Link to="/confidentialite" className="hover:underline">Confidentialité</Link>
            <span aria-hidden>·</span>
            <Link to="/rgpd" className="hover:underline">RGPD</Link>
            <span aria-hidden>·</span>
            <Link to="/cookies" className="hover:underline">Cookies</Link>
          </div>
          {!isNativeApp() && (
            <Link to="/?web=1" className="inline-block mt-4 text-xs text-slate-400 underline">
              Voir le site web
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
