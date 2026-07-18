import { useState } from 'react'
import { Trash2, AlertTriangle, Briefcase, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, EmptyState } from '@/components/ui/Card'
import { useApp, useOwnerMissions } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'
import type { Mission } from '@/types'

const statusKey: Record<Mission['status'], TranslationKey> = {
  pending: 'commonApp.pending',
  accepted: 'commonApp.accepted',
  declined: 'commonApp.declined',
  completed: 'commonApp.completed',
  cancelled: 'commonApp.cancelled',
}

export default function OwnerMissionsPage() {
  const { t } = useI18n()
  const { deleteMission, cancelMission } = useApp()
  const missions = useOwnerMissions()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (m: Mission) => {
    if (m.status === 'accepted') return

    const confirmed = window.confirm(t('ownerMissions.confirmDelete'))
    if (!confirmed) return

    setBusyId(m.id)
    setError(null)
    const err = await deleteMission(m.id)
    if (err) setError(err)
    setBusyId(null)
  }

  const handleCancel = async (m: Mission) => {
    if (!window.confirm(t('ownerMissions.confirmCancel'))) return

    setBusyId(m.id)
    setError(null)
    const err = await cancelMission(m.id)
    if (err) setError(err)
    setBusyId(null)
  }

  const canCancel = (m: Mission) => m.status === 'pending' || m.status === 'accepted'
  const canDelete = (m: Mission) => m.status === 'pending' || m.status === 'declined' || m.status === 'cancelled'

  return (
    <DashboardLayout variant="owner" title={t('ownerMissions.title')}>
      <div className="max-w-3xl space-y-6">
        <p className="text-sm text-slate-600">
          Annulez une mission en cours (déjà acceptée par un pet-sitter) ou supprimez les demandes
          en double / envoyées par erreur.
        </p>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        {missions.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title={t('ownerMissions.emptyTitle')}
              description={t('ownerMissions.emptyDesc')}
            />
            <div className="text-center pb-4">
              <Link to="/app/urgence">
                <Button variant="outline" size="sm">{t('ownerMissions.declare')}</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {missions.map(m => (
              <Card key={m.id} className="!p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{m.petName}</p>
                      <Badge variant="danger">{t('commonApp.emergency')}</Badge>
                      <Badge variant={
                        m.status === 'pending' ? 'warning'
                          : m.status === 'accepted' ? 'success'
                            : m.status === 'cancelled' ? 'default'
                              : 'default'
                      }>
                        {t(statusKey[m.status])}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{formatDateTime(m.createdAt)}</p>
                    {m.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {canCancel(m) && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={XCircle}
                        disabled={busyId === m.id}
                        className="!text-amber-700 !border-amber-200 hover:!bg-amber-50"
                        onClick={() => void handleCancel(m)}
                      >
                        {busyId === m.id ? '…' : t('commonApp.cancel')}
                      </Button>
                    )}
                    {canDelete(m) && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        disabled={busyId === m.id}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                        onClick={() => void handleDelete(m)}
                      >
                        {t('commonApp.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
