import { CheckCircle, XCircle, Clock, Check, Shield, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader, Badge } from '@/components/ui/Card'
import { useApp, usePetSitterMissions } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { formatDateTime } from '@/lib/utils'

export default function PetSitterDashboard() {
  const { t } = useI18n()
  const { petSitterProfile } = useApp()
  const myMissions = usePetSitterMissions()

  const counts = {
    received: myMissions.filter(m => m.status === 'pending').length,
    accepted: myMissions.filter(m => m.status === 'accepted').length,
    declined: myMissions.filter(m => m.status === 'declined').length,
    completed: myMissions.filter(m => m.status === 'completed').length,
  }

  const statusLabel = (status: string) => {
    if (status === 'pending') return t('commonApp.pending')
    if (status === 'accepted') return t('commonApp.accepted')
    if (status === 'completed') return t('commonApp.completed')
    return t('commonApp.declined')
  }

  return (
    <DashboardLayout variant="petsitter" title={t('petsitterDash.title')}>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{t('petsitterDash.heading')}</h2>
          <p className="text-slate-600">{t('petsitterDash.subtitle')}</p>
        </div>

        {!petSitterProfile?.verified && (
          <Card className="!p-4 bg-amber-50 border-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">{t('petsitterDash.pendingTitle')}</p>
                <p className="mt-1">{t('petsitterDash.pendingBody')}</p>
              </div>
            </div>
          </Card>
        )}

        {petSitterProfile?.verified && (
          <Card className="!p-4 bg-brand-50 border-brand-200">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-800">{t('petsitterDash.verifiedBanner')}</p>
            </div>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Clock} label={t('petsitterDash.received')} value={counts.received} color="blue" />
          <StatCard icon={CheckCircle} label={t('petsitterDash.accepted')} value={counts.accepted} color="brand" />
          <StatCard icon={XCircle} label={t('petsitterDash.declined')} value={counts.declined} color="accent" />
          <StatCard icon={Check} label={t('petsitterDash.completed')} value={counts.completed} color="purple" />
        </div>

        <Card>
          <CardHeader title={t('petsitterDash.recent')} />
          <div className="space-y-3">
            {myMissions.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    {m.petName} — {m.type === 'urgence' ? `🚨 ${t('commonApp.emergency')}` : t('petsitterDash.care')}
                  </p>
                  <p className="text-xs text-slate-500">{m.ownerName} — {formatDateTime(m.createdAt)}</p>
                </div>
                <Badge variant={m.status === 'pending' ? 'warning' : m.status === 'accepted' ? 'success' : m.status === 'completed' ? 'info' : 'danger'}>
                  {statusLabel(m.status)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
