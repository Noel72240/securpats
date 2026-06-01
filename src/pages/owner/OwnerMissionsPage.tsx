import { useState } from 'react'
import { Trash2, AlertTriangle, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, EmptyState } from '@/components/ui/Card'
import { useApp, useOwnerMissions } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'
import type { Mission } from '@/types'

const statusLabel: Record<Mission['status'], string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  declined: 'Refusée',
  completed: 'Terminée',
}

export default function OwnerMissionsPage() {
  const { deleteMission } = useApp()
  const missions = useOwnerMissions()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (m: Mission) => {
    if (m.status === 'accepted') return

    const confirmed = window.confirm(
      `Supprimer la demande d'urgence pour ${m.petName} ?\n\nLes pet-sitters ne la verront plus.`,
    )
    if (!confirmed) return

    setBusyId(m.id)
    setError(null)
    const err = await deleteMission(m.id)
    if (err) setError(err)
    setBusyId(null)
  }

  return (
    <DashboardLayout variant="owner" title="Mes demandes d'urgence">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm text-slate-600">
          Chaque déclaration d&apos;urgence crée une mission visible par les pet-sitters VIP.
          Supprimez les demandes en double ou envoyées par erreur.
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
              title="Aucune demande"
              description="Vos urgences déclarées apparaîtront ici."
            />
            <div className="text-center pb-4">
              <Link to="/app/urgence">
                <Button variant="outline" size="sm">Déclarer une urgence</Button>
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
                      <Badge variant="danger">Urgence</Badge>
                      <Badge variant={m.status === 'pending' ? 'warning' : m.status === 'accepted' ? 'success' : 'default'}>
                        {statusLabel[m.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{formatDateTime(m.createdAt)}</p>
                    {m.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    disabled={busyId === m.id || m.status === 'accepted'}
                    className="!text-red-600 !border-red-200 hover:!bg-red-50 shrink-0"
                    onClick={() => void handleDelete(m)}
                  >
                    {busyId === m.id ? '…' : 'Supprimer'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
