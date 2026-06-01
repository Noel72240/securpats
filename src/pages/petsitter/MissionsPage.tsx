import { useState } from 'react'
import { Check, X, Eye, Briefcase, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, Modal, EmptyState } from '@/components/ui/Card'
import { useApp, usePetSitterMissions } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'
import type { Mission } from '@/types'

export default function MissionsPage() {
  const { updateMissionStatus, petSitterProfile, currentUser } = useApp()
  const missions = usePetSitterMissions()
  const [selected, setSelected] = useState<Mission | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const canManageMissions = petSitterProfile?.verified === true

  const handleStatus = async (id: string, status: Mission['status']) => {
    setActionError(null)
    setBusyId(id)
    const err = await updateMissionStatus(id, status)
    if (err) setActionError(err)
    setBusyId(null)
  }

  const filtered = filter === 'all' ? missions : missions.filter(m => m.status === filter)
  const isMine = (m: Mission) => m.petsitterId === currentUser?.id
  const canAccept = (m: Mission) => m.status === 'pending' && !m.petsitterId

  const statusLabel = (s: Mission['status']) => ({
    pending: 'En attente', accepted: 'Acceptée', declined: 'Refusée', completed: 'Terminée',
  }[s])

  const statusVariant = (s: Mission['status']) => ({
    pending: 'warning' as const, accepted: 'success' as const, declined: 'danger' as const, completed: 'info' as const,
  }[s])

  return (
    <DashboardLayout variant="petsitter" title="Missions">
      <div className="space-y-6">
        {!canManageMissions && (
          <Card className="!p-4 bg-amber-50 border-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Votre compte est en cours de validation. Vous pourrez accepter ou refuser des missions
                une fois que l&apos;équipe SécurPats aura validé votre dossier.
              </p>
            </div>
          </Card>
        )}
        {actionError && (
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {actionError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'accepted', 'declined', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              {f === 'all' ? 'Toutes' : statusLabel(f as Mission['status'])}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card><EmptyState icon={Briefcase} title="Aucune mission" description="Les nouvelles missions apparaîtront ici." /></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(m => (
              <Card key={m.id} hover className="!p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{m.petName}</p>
                      <Badge variant={m.type === 'urgence' ? 'danger' : 'info'}>{m.type === 'urgence' ? 'Urgence' : 'Garde'}</Badge>
                      <Badge variant={statusVariant(m.status)}>{statusLabel(m.status)}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{m.ownerName} — {formatDateTime(m.createdAt)}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{m.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setSelected(m)}>Détails</Button>
                    {canAccept(m) && canManageMissions && (
                      <>
                        <Button
                          size="sm"
                          icon={Check}
                          disabled={busyId === m.id}
                          onClick={() => void handleStatus(m.id, 'accepted')}
                        >
                          {busyId === m.id ? 'En cours…' : 'Accepter'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={X}
                          disabled={busyId === m.id}
                          onClick={() => void handleStatus(m.id, 'declined')}
                        >
                          Refuser
                        </Button>
                      </>
                    )}
                    {m.status === 'accepted' && isMine(m) && canManageMissions && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === m.id}
                        onClick={() => void handleStatus(m.id, 'completed')}
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Détails de la mission">
        {selected && (
          <div className="space-y-4">
            <div><span className="text-sm text-slate-500">Animal</span><p className="font-semibold">{selected.petName}</p></div>
            <div><span className="text-sm text-slate-500">Propriétaire</span><p className="font-semibold">{selected.ownerName}</p></div>
            <div><span className="text-sm text-slate-500">Type</span><p className="font-semibold capitalize">{selected.type}</p></div>
            <div><span className="text-sm text-slate-500">Adresse</span><p>{selected.address}</p></div>
            <div><span className="text-sm text-slate-500">Description</span><p className="whitespace-pre-line">{selected.description}</p></div>
            <div><span className="text-sm text-slate-500">Date</span><p>{formatDateTime(selected.createdAt)}</p></div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
