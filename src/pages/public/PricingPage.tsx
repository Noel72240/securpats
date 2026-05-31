import { Link } from 'react-router-dom'
import { Check, Star, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PLAN_PRICES } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { arePaymentsBlocked } from '@/lib/maintenance'
import { PETSITTER_VIP_PLAN } from '@/lib/stripe/petsitter-vip'

const ownerFeatures = [
  'Animaux illimités',
  'Jusqu\'à 5 référents d\'urgence',
  'QR Code et carte d\'urgence',
  'Stockage de documents sécurisé',
  'Alertes d\'urgence automatiques',
  'Fiche de secours publique',
  'Support client prioritaire',
]

const petsitterFeatures = [
  'Accès complet à l\'espace pet-sitter',
  'Réception des missions d\'urgence',
  'Profil vérifié visible par les propriétaires',
  'Gestion des disponibilités',
  'Pièce d\'identité vérifiée par SécurPats',
]

export default function PricingPage() {
  const { siteSettings } = useApp()
  const paymentsBlocked = arePaymentsBlocked(siteSettings)

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {paymentsBlocked && (
            <div className="mb-8 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                {siteSettings.maintenance.message || 'Les inscriptions restent possibles, mais les paiements sont temporairement suspendus.'}
              </p>
            </div>
          )}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Tarifs simples et transparents</h1>
            <p className="text-lg text-slate-600">Propriétaires et pet-sitters — des formules claires, sans frais cachés.</p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Propriétaires d&apos;animaux</h2>
            <p className="text-sm text-slate-500 text-center mb-8">Protection complète de vos compagnons en cas d&apos;urgence</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card padding="lg" className="relative">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Mensuel</h3>
              <p className="text-sm text-slate-500 mb-6">Flexibilité maximale</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{PLAN_PRICES.monthly.toFixed(2).replace('.', ',')}</span>
                <span className="text-slate-500 ml-1">€/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {ownerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button variant="outline" className="w-full" disabled>Paiements suspendus</Button>
              ) : (
                <Link to="/inscription">
                  <Button variant="outline" className="w-full">Choisir mensuel</Button>
                </Link>
              )}
            </Card>

            <Card padding="lg" className="relative border-2 border-brand-500 shadow-lg shadow-brand-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-accent-500 text-white text-xs font-bold">
                  <Star className="w-3 h-3" /> MEILLEURE OFFRE
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Annuel</h3>
              <p className="text-sm text-slate-500 mb-6">Économisez 2 mois</p>
              <div className="mb-2">
                <span className="text-4xl font-extrabold text-brand-600">{PLAN_PRICES.yearly.toFixed(2).replace('.', ',')}</span>
                <span className="text-slate-500 ml-1">€/an</span>
              </div>
              <p className="text-sm text-brand-600 font-semibold mb-6">
                Soit {(PLAN_PRICES.yearly / 12).toFixed(2).replace('.', ',')} €/mois — économie de {(PLAN_PRICES.monthly * 12 - PLAN_PRICES.yearly).toFixed(2).replace('.', ',')} €
              </p>
              <ul className="space-y-3 mb-8">
                {ownerFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button className="w-full" icon={ArrowRight} disabled>Paiements suspendus</Button>
              ) : (
                <Link to="/inscription">
                  <Button className="w-full" icon={ArrowRight}>Choisir annuel</Button>
                </Link>
              )}
            </Card>
          </div>

          <div className="mt-20 mb-10">
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Pet-Sitters</h2>
            <p className="text-sm text-slate-500 text-center mb-8">
              Intervenez en cas d&apos;urgence animale dans votre zone — statut VIP vérifié
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card padding="lg" className="relative border-2 border-blue-500 shadow-lg shadow-blue-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  <Shield className="w-3 h-3" /> PET-SITTER VIP
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{PETSITTER_VIP_PLAN.name}</h3>
              <p className="text-sm text-slate-500 mb-6">Inscription gratuite, abonnement pour accéder à l&apos;espace</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-blue-600">
                  {PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-slate-500 ml-1">€/mois</span>
              </div>
              <p className="text-sm text-blue-600 font-medium mb-6">
                Pièce d&apos;identité obligatoire — vérification par l&apos;équipe SécurPats
              </p>
              <ul className="space-y-3 mb-8">
                {petsitterFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {paymentsBlocked ? (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" icon={ArrowRight} disabled>
                  Paiements suspendus
                </Button>
              ) : (
                <Link to="/pet-sitter/inscription">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" icon={ArrowRight}>
                    Devenir Pet-Sitter VIP
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
