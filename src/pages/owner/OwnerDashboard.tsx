import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Dog, Users, FileText, CreditCard, ArrowRight, Trash2, Briefcase, Shield, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useOwnerPets, useOwnerReferents, useOwnerDocuments, useOwnerActivities, useOwnerMissions, useApp } from '@/contexts/AppContext'
import { formatDateTime } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'

export default function OwnerDashboard() {
  const { t, locale } = useI18n()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const documents = useOwnerDocuments()
  const activities = useOwnerActivities()
  const missions = useOwnerMissions()
  const { subscription, deleteActivity } = useApp()
  const [activityBusyId, setActivityBusyId] = useState<string | null>(null)
  const pendingMissions = missions.filter(m => m.status === 'pending').length
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <DashboardLayout variant="owner" title={t('ownerDash.title')}>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{t('ownerDash.hello')}</h2>
          <p className="text-slate-600">{t('ownerDash.subtitle')}</p>
        </div>

        <Link
          to="/app/pet-sitters"
          className="block rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-600 to-orange-500 p-5 sm:p-6 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-[1.01] transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('ownerDash.emergencyLabel')}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-0.5">{t('ownerDash.findNow')}</h3>
              <p className="text-sm text-white/90 mt-1">
                {t('ownerDash.findDesc')}
              </p>
            </div>
            <span className="inline-flex items-center justify-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl bg-white text-red-700 font-bold text-sm shrink-0">
              {t('ownerDash.seeDirectory')}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Dog} label={t('ownerDash.pets')} value={pets.length} />
          <StatCard icon={Users} label={t('ownerDash.referents')} value={referents.length} color="blue" />
          <StatCard icon={FileText} label={t('ownerDash.documents')} value={documents.length} color="purple" />
          <StatCard
            icon={CreditCard}
            label={t('ownerDash.subscription')}
            value={subscription?.status === 'active' ? t('commonApp.active') : t('commonApp.inactive')}
            color="accent"
          />
        </div>

        {subscription && (
          <Card className="bg-brand-50 border-brand-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {subscription.plan === 'yearly' ? t('ownerDash.planYearly') : t('ownerDash.planMonthly')}
                </p>
                <p className="text-sm text-slate-600">
                  {t('ownerDash.renewalOn', {
                    date: new Date(subscription.renewalDate).toLocaleDateString(dateLocale),
                  })}
                  {subscription.autoRenew && t('ownerDash.autoRenew')}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
                {subscription.status === 'active' ? t('commonApp.active') : subscription.status}
              </Badge>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title={t('ownerDash.myPets')} action={
              <Link to="/app/animaux"><Button variant="ghost" size="sm" icon={ArrowRight}>{t('ownerDash.seeAll')}</Button></Link>
            } />
            {pets.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('ownerDash.noPets')}</p>
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
            <CardHeader
              title={t('ownerDash.recentActivity')}
              action={
                pendingMissions > 0 ? (
                  <Link to="/app/missions" className="text-xs font-medium text-brand-600 hover:underline">
                    {pendingMissions} urgence{pendingMissions > 1 ? 's' : ''} en cours
                  </Link>
                ) : (
                  <Link to="/app/missions"><Briefcase className="w-5 h-5 text-slate-400" /></Link>
                )
              }
            />
            <div className="space-y-3">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3 text-sm group">
                  <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">{act.message}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(act.date)}</p>
                  </div>
                  <button
                    type="button"
                    title={t('ownerDash.removeHistory')}
                    disabled={activityBusyId === act.id}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                    onClick={async () => {
                      if (!window.confirm(t('ownerDash.removeHistory'))) return
                      setActivityBusyId(act.id)
                      await deleteActivity(act.id)
                      setActivityBusyId(null)
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {pendingMissions > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link to="/app/missions">
                  <Button variant="ghost" size="sm" icon={Briefcase}>{t('ownerDash.manageMissions')}</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
