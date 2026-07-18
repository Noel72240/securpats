import { useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, Send, Mail, Phone, Loader2, MessageSquare, Clock, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import { useOwnerPets, useOwnerReferents, useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'

type NotifyResult = {
  ok: boolean
  emailsSent: number
  smsSent: number
  referentsCount?: number
  pendingConfirmation?: boolean
  error?: string
  emailConfigured?: boolean
  smsConfigured?: boolean
}

export default function EmergencyPage() {
  const { t } = useI18n()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const { declareEmergency } = useApp()
  const [petId, setPetId] = useState(pets[0]?.id || '')
  const [description, setDescription] = useState('')
  const [declared, setDeclared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifyResult, setNotifyResult] = useState<NotifyResult | null>(null)

  const referentsReachable = referents.filter(r => r.email?.trim() || r.phone?.trim())
  const referentsIncomplete = referents.filter(r => !r.email?.trim() && !r.phone?.trim())

  const handleDeclare = async () => {
    if (!petId || !description.trim()) return

    if (referentsIncomplete.length > 0) {
      alert(`Ajoutez au moins un email ou un téléphone pour : ${referentsIncomplete.map(r => r.firstName).join(', ')} (menu Référents).`)
      return
    }

    setLoading(true)
    const result = await declareEmergency(petId, description.trim())
    setNotifyResult(result)
    setDeclared(true)
    setLoading(false)
  }

  if (declared) {
    const pet = pets.find(p => p.id === petId)
    const anySent = (notifyResult?.emailsSent ?? 0) > 0 || (notifyResult?.smsSent ?? 0) > 0

    return (
      <DashboardLayout variant="owner" title={t('ownerEmergency.alertSent')}>
        <Card padding="lg" className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t('ownerEmergency.sentFor', { pet: pet?.name ?? '' })}
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Vos référents doivent confirmer leur disponibilité. La procédure d&apos;urgence démarrera
            dès qu&apos;un référent aura validé.
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-900 font-medium">
                {t('ownerEmergency.waiting')} ({notifyResult?.referentsCount ?? referents.length})
              </span>
            </div>

            {(notifyResult?.emailConfigured || notifyResult?.emailsSent) && (
              <div className={`p-3 rounded-xl ${notifyResult?.emailsSent ? 'bg-brand-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 flex-shrink-0 ${notifyResult?.emailsSent ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-sm">
                    {notifyResult?.emailsSent
                      ? `${notifyResult.emailsSent} email(s)`
                      : t('ownerEmergency.noNotif')}
                  </span>
                </div>
              </div>
            )}

            {(notifyResult?.smsConfigured || notifyResult?.smsSent) && (
              <div className={`p-3 rounded-xl ${notifyResult?.smsSent ? 'bg-brand-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-5 h-5 flex-shrink-0 ${notifyResult?.smsSent ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-sm">
                    {notifyResult?.smsSent
                      ? `${notifyResult.smsSent} SMS`
                      : t('ownerEmergency.noNotif')}
                  </span>
                </div>
              </div>
            )}

            {!notifyResult?.emailConfigured && !notifyResult?.smsConfigured && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
                {t('ownerEmergency.noNotif')}
              </div>
            )}

            {notifyResult?.error && !anySent && (
              <p className="text-xs text-red-600 p-3 bg-red-50 rounded-xl break-words">{notifyResult.error}</p>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-medium mb-2">
                <Bell className="w-4 h-4" />
                {t('ownerEmergency.afterConfirm')}
              </div>
              <p className="text-sm text-slate-600">
                Une mission d&apos;urgence sera créée et tous les référents recevront l&apos;alerte complète avec la fiche secours.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                <Phone className="w-4 h-4" />
                {t('ownerEmergency.phoneContact')}
              </div>
              {referents.map(r => (
                <p key={r.id} className="text-sm text-amber-900">
                  {r.priority}. {r.firstName} {r.lastName} —{' '}
                  <a href={`tel:${r.phone}`} className="underline font-medium">{r.phone}</a>
                </p>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-left">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <Shield className="w-4 h-4" />
                {t('ownerEmergency.orFind')}
              </div>
              <p className="text-sm text-red-900/80 mb-3">
                Consultez l&apos;annuaire des pet-sitters vérifiés et appelez-les directement.
              </p>
              <Link to="/app/pet-sitters">
                <Button size="sm" className="!bg-red-600 hover:!bg-red-700" icon={Shield}>
                  {t('ownerEmergency.findCta')}
                </Button>
              </Link>
            </div>
          </div>

          <Button className="mt-6" onClick={() => { setDeclared(false); setDescription(''); setNotifyResult(null) }}>
            {t('commonApp.back')}
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="owner" title={t('ownerEmergency.title')}>
      <div className="max-w-lg mx-auto">
        <Card padding="lg" className="border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">{t('ownerEmergency.confirmTitle')}</h2>
              <p className="text-sm text-red-500">
                Vos référents recevront un email/SMS pour confirmer leur disponibilité.
                La procédure démarre dès qu&apos;un référent valide.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Select
              label="Animal concerné"
              value={petId}
              onChange={e => setPetId(e.target.value)}
              options={pets.map(p => ({ value: p.id, label: p.name }))}
            />
            <Textarea
              label="Description de la situation"
              placeholder="Décrivez brièvement la situation d'urgence..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700 mb-2">Référents qui seront sollicités :</p>
              {referents.length === 0 ? (
                <p className="text-sm text-red-500">{t('ownerEmergency.noReferents')}</p>
              ) : (
                referents.map(r => (
                  <p key={r.id} className="text-sm text-slate-600">
                    {r.priority}. {r.firstName} {r.lastName}
                    {r.email ? ` — ${r.email}` : ' — (pas d\'email)'}
                    {r.phone ? ` — ${r.phone}` : ''}
                  </p>
                ))
              )}
            </div>

            <Button
              variant="danger"
              icon={loading ? Loader2 : Send}
              className="w-full"
              onClick={handleDeclare}
              disabled={!description.trim() || !petId || referentsReachable.length === 0}
              loading={loading}
            >
              {t('ownerEmergency.confirmCta')}
            </Button>

            <Link to="/app/pet-sitters" className="block">
              <Button
                type="button"
                className="w-full !bg-orange-500 hover:!bg-orange-600"
                icon={Shield}
              >
                {t('ownerEmergency.orFind')}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
