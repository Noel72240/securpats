import { CheckCircle, XCircle, Clock, Check } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader, Badge } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'

export default function PetSitterDashboard() {
  const { missions } = useApp()
  const myMissions = missions.filter(m => m.petsitterId === 'user-2' || m.status === 'pending')

  const counts = {
    received: myMissions.filter(m => m.status === 'pending').length,
    accepted: myMissions.filter(m => m.status === 'accepted').length,
    declined: myMissions.filter(m => m.status === 'declined').length,
    completed: myMissions.filter(m => m.status === 'completed').length,
  }

  return (
    <DashboardLayout variant="petsitter" title="Tableau de bord">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Espace Pet-Sitter</h2>
          <p className="text-slate-600">Gérez vos missions et disponibilités.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Clock} label="Missions reçues" value={counts.received} color="blue" />
          <StatCard icon={CheckCircle} label="Acceptées" value={counts.accepted} color="brand" />
          <StatCard icon={XCircle} label="Refusées" value={counts.declined} color="accent" />
          <StatCard icon={Check} label="Terminées" value={counts.completed} color="purple" />
        </div>

        <Card>
          <CardHeader title="Missions récentes" />
          <div className="space-y-3">
            {myMissions.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{m.petName} — {m.type === 'urgence' ? '🚨 Urgence' : 'Garde'}</p>
                  <p className="text-xs text-slate-500">{m.ownerName} — {formatDateTime(m.createdAt)}</p>
                </div>
                <Badge variant={m.status === 'pending' ? 'warning' : m.status === 'accepted' ? 'success' : m.status === 'completed' ? 'info' : 'danger'}>
                  {m.status === 'pending' ? 'En attente' : m.status === 'accepted' ? 'Acceptée' : m.status === 'completed' ? 'Terminée' : 'Refusée'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
