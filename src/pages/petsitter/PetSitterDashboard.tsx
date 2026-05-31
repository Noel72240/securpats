import { CheckCircle, XCircle, Clock, Check, Shield, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader, Badge } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'

export default function PetSitterDashboard() {
  const { missions, currentUser, petSitterProfile } = useApp()
  const myMissions = missions.filter(m => m.petsitterId === currentUser?.id || m.status === 'pending')

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
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Espace Pet-Sitter VIP</h2>
          <p className="text-slate-600">Abonnement VIP actif — vous pouvez recevoir des missions d&apos;urgence.</p>
        </div>

        {!petSitterProfile?.verified && (
          <Card className="!p-4 bg-amber-50 border-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Compte en attente de validation</p>
                <p className="mt-1">
                  Votre pièce d&apos;identité a bien été reçue. L&apos;équipe SécurPats vérifie votre dossier avant
                  de vous proposer des missions. Délai habituel : 48 h ouvrées.
                </p>
              </div>
            </div>
          </Card>
        )}

        {petSitterProfile?.verified && (
          <Card className="!p-4 bg-brand-50 border-brand-200">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-brand-800">
                <strong>Profil vérifié</strong> — vous pouvez recevoir des missions d&apos;urgence dans votre zone.
              </p>
            </div>
          </Card>
        )}

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
