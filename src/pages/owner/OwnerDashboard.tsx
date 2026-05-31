import { Link } from 'react-router-dom'
import { Dog, Users, FileText, CreditCard, Activity, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOwnerPets, useOwnerReferents, useOwnerDocuments, useOwnerActivities, useApp } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'

export default function OwnerDashboard() {
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const documents = useOwnerDocuments()
  const activities = useOwnerActivities()
  const { subscription } = useApp()

  return (
    <DashboardLayout variant="owner" title="Tableau de bord">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Bonjour ! 👋</h2>
          <p className="text-slate-600">Voici un aperçu de votre espace SécurPats.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Dog} label="Animaux" value={pets.length} />
          <StatCard icon={Users} label="Référents" value={referents.length} color="blue" />
          <StatCard icon={FileText} label="Documents" value={documents.length} color="purple" />
          <StatCard icon={CreditCard} label="Abonnement" value={subscription?.status === 'active' ? 'Actif' : 'Inactif'} color="accent" />
        </div>

        {subscription && (
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  Abonnement {subscription.plan === 'yearly' ? 'annuel' : 'mensuel'}
                </p>
                <p className="text-sm text-slate-600">
                  Renouvellement le {new Date(subscription.renewalDate).toLocaleDateString('fr-FR')}
                  {subscription.autoRenew && ' — Renouvellement automatique activé'}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                {subscription.status === 'active' ? 'Actif' : subscription.status}
              </Badge>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Mes animaux" action={
              <Link to="/app/animaux"><Button variant="ghost" size="sm" icon={ArrowRight}>Voir tout</Button></Link>
            } />
            {pets.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucun animal enregistré.</p>
            ) : (
              <div className="space-y-3">
                {pets.slice(0, 3).map(pet => (
                  <Link key={pet.id} to={`/app/animaux/${pet.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    {pet.photo ? (
                      <img src={pet.photo} alt={pet.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <Dog className="w-5 h-5 text-brand-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{pet.name}</p>
                      <p className="text-xs text-slate-500">{pet.species} — {pet.breed}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Dernières activités" action={<Activity className="w-5 h-5 text-slate-400" />} />
            <div className="space-y-3">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-700">{act.message}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(act.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
