import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import type { SiteMaintenanceMode } from '@/types'

type Props = {
  variant?: 'dashboard' | 'full'
}

export function AdminMaintenanceControl({ variant = 'dashboard' }: Props) {
  const { siteSettings, updateSiteSettings } = useApp()
  const { maintenance } = siteSettings
  const [saved, setSaved] = useState(false)

  const isActive = maintenance.enabled
  const paymentsBlocked = isActive && maintenance.blockPayments

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const patchMaintenance = (patch: Partial<typeof maintenance>) => {
    updateSiteSettings({ maintenance: { ...maintenance, ...patch } })
    flashSaved()
  }

  const toggleMaintenance = () => {
    if (isActive) {
      patchMaintenance({ enabled: false })
      return
    }
    patchMaintenance({
      enabled: true,
      blockPayments: true,
      mode: 'maintenance',
      message: maintenance.message || 'Le site est en maintenance. Les abonnements reprendront très bientôt.',
    })
  }

  if (variant === 'dashboard') {
    return (
      <div className={cn(
        'rounded-2xl border-2 p-5 transition-colors',
        isActive
          ? 'border-orange-300 bg-orange-50'
          : 'border-slate-200 bg-white',
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
              isActive ? 'bg-orange-600' : 'bg-slate-200',
            )}>
              <Wrench className={cn('w-5 h-5', isActive ? 'text-white' : 'text-slate-600')} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-900 text-lg">Mode maintenance</p>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                    <AlertTriangle className="w-3 h-3" />
                    ACTIF
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Site ouvert
                  </span>
                )}
                {saved && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Enregistré
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {isActive
                  ? 'Bannière visible sur tout le site. Les nouveaux abonnements sont bloqués.'
                  : 'Activez pour suspendre les paiements pendant vos travaux.'}
              </p>
              {isActive && paymentsBlocked && (
                <p className="text-xs text-orange-800 mt-2 inline-flex items-center gap-1.5 font-medium">
                  <CreditCard className="w-3.5 h-3.5" />
                  Paiements Stripe suspendus
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={toggleMaintenance}
              className={cn(
                'relative inline-flex h-11 w-[4.5rem] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors',
                isActive ? 'border-orange-600 bg-orange-600' : 'border-slate-300 bg-slate-200',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-9 w-9 transform rounded-full bg-white shadow transition-transform mt-0.5',
                  isActive ? 'translate-x-8' : 'translate-x-0.5',
                )}
              />
            </button>
            <Link to="/admin/contenu-site?tab=maintenance">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Options avancées
              </Button>
            </Link>
          </div>
        </div>

        {isActive && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <Textarea
              label="Message affiché aux visiteurs"
              rows={2}
              value={maintenance.message}
              onChange={e => patchMaintenance({ message: e.target.value })}
              placeholder="Ex. : Mise à jour en cours, les abonnements reprendront très bientôt."
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
        <input
          type="checkbox"
          className="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          checked={maintenance.enabled}
          onChange={e => patchMaintenance({ enabled: e.target.checked })}
        />
        <div>
          <p className="font-semibold text-slate-900">Activer la bannière</p>
          <p className="text-sm text-slate-600 mt-1">
            Visible sur le site public et les espaces connectés (propriétaire, pet-sitter, admin).
          </p>
        </div>
      </label>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Type de bannière</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {([
            { id: 'development' as SiteMaintenanceMode, label: 'En cours de développement', desc: 'Bannière jaune — site en préparation' },
            { id: 'maintenance' as SiteMaintenanceMode, label: 'Maintenance', desc: 'Bannière orange — indisponibilité temporaire' },
          ]).map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => patchMaintenance({ mode: opt.id })}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-colors',
                maintenance.mode === opt.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <p className="font-semibold text-slate-900">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Message affiché"
        rows={3}
        value={maintenance.message}
        onChange={e => patchMaintenance({ message: e.target.value })}
        placeholder="Ex. : Nous mettons à jour la plateforme. Les paiements reprendront très bientôt."
      />

      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
        <input
          type="checkbox"
          className="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          checked={maintenance.blockPayments}
          onChange={e => patchMaintenance({ blockPayments: e.target.checked })}
        />
        <div>
          <p className="font-semibold text-slate-900">Bloquer les paiements Stripe</p>
          <p className="text-sm text-slate-600 mt-1">
            Empêche la création de sessions de paiement (checkout). Les abonnements déjà actifs restent gérables via le portail Stripe.
          </p>
        </div>
      </label>

      {saved && (
        <p className="text-sm text-emerald-700 font-medium inline-flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Modifications enregistrées
        </p>
      )}

      {maintenance.enabled && (
        <div className={cn(
          'p-4 rounded-xl text-sm',
          maintenance.mode === 'development'
            ? 'bg-amber-50 border border-amber-200 text-amber-900'
            : 'bg-orange-50 border border-orange-200 text-orange-900',
        )}>
          <p className="font-semibold">Aperçu de la bannière</p>
          <p className="mt-1">
            {maintenance.mode === 'development' ? 'Site en cours de développement' : 'Maintenance en cours'}
            {maintenance.message && ` — ${maintenance.message}`}
            {maintenance.blockPayments && ' · Paiements suspendus'}
          </p>
        </div>
      )}
    </div>
  )
}
