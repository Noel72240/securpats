import { Link } from 'react-router-dom'
import { Scale, FileText, Shield, Lock, Cookie, ChevronRight, ArrowLeft } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { isNativeApp } from '@/lib/platform'

const LEGAL_LINKS = [
  {
    to: '/mentions-legales',
    title: 'Mentions légales',
    subtitle: 'Éditeur, hébergeur, contact légal',
    icon: Scale,
  },
  {
    to: '/cgu',
    title: 'CGU',
    subtitle: 'Conditions générales d’utilisation',
    icon: FileText,
  },
  {
    to: '/confidentialite',
    title: 'Confidentialité',
    subtitle: 'Politique de confidentialité',
    icon: Lock,
  },
  {
    to: '/rgpd',
    title: 'RGPD',
    subtitle: 'Vos droits et le traitement des données',
    icon: Shield,
  },
  {
    to: '/cookies',
    title: 'Cookies',
    subtitle: 'Politique relative aux cookies',
    icon: Cookie,
  },
] as const

/** Hub légal — accessible depuis l’app (accueil + menus espaces). */
export default function MobileLegalHubPage() {
  const backTo = isNativeApp() ? '/' : '/'

  return (
    <AuthShell>
      <section className="py-8 sm:py-12 px-4 max-w-lg mx-auto w-full">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Informations légales</h1>
          <p className="text-sm text-slate-600 mt-2">
            Mentions légales, CGU, confidentialité, RGPD et cookies — documents applicables à SécurPats
            (site et application).
          </p>
        </div>

        <div className="space-y-3">
          {LEGAL_LINKS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white active:scale-[0.98] transition-transform shadow-sm"
            >
              <span className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0 text-left">
                <span className="block font-semibold text-slate-900">{item.title}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{item.subtitle}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </AuthShell>
  )
}
