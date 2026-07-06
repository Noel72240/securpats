import { useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, Send, Mail, Phone, Loader2, MessageSquare } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import { useOwnerPets, useOwnerReferents, useApp } from '@/contexts/AppContext'
import type { EmergencyNotifyResponse } from '@/lib/emergency/notify'

export default function EmergencyPage() {
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const { declareEmergency } = useApp()
  const [petId, setPetId] = useState(pets[0]?.id || '')
  const [description, setDescription] = useState('')
  const [declared, setDeclared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifyResult, setNotifyResult] = useState<(EmergencyNotifyResponse & { ok: boolean }) | null>(null)

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
      <DashboardLayout variant="owner" title="Urgence déclarée">
        <Card padding="lg" className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Urgence déclarée pour {pet?.name}</h2>
          <p className="text-sm text-slate-600 mb-6">
            Mission d&apos;urgence créée{anySent ? ' et référents notifiés.' : '.'}
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50">
              <Bell className="w-5 h-5 text-brand-600" />
              <span className="text-sm text-brand-700 font-medium">Mission d&apos;urgence enregistrée</span>
              <CheckCircle className="w-4 h-4 text-brand-500 ml-auto" />
            </div>

            {(notifyResult?.emailConfigured || notifyResult?.emailsSent) && (
              <div className={`p-3 rounded-xl ${notifyResult?.emailsSent ? 'bg-brand-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 flex-shrink-0 ${notifyResult?.emailsSent ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-sm">
                    {notifyResult?.emailsSent
                      ? `${notifyResult.emailsSent} email(s) envoyé(s)`
                      : 'Aucun email envoyé'}
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
                      ? `${notifyResult.smsSent} SMS envoyé(s)`
                      : 'Aucun SMS envoyé'}
                  </span>
                </div>
              </div>
            )}

            {!notifyResult?.emailConfigured && !notifyResult?.smsConfigured && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
                Notifications automatiques non configurées sur le serveur — appelez vos référents directement.
              </div>
            )}

            {notifyResult?.error && !anySent && (
              <p className="text-xs text-red-600 p-3 bg-red-50 rounded-xl break-words">{notifyResult.error}</p>
            )}

            {notifyResult?.results && notifyResult.results.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 text-left">
                <p className="text-xs font-semibold text-slate-700 mb-2">Détail par référent</p>
                <ul className="space-y-2">
                  {notifyResult.results.map((r, i) => (
                    <li key={i} className="text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{r.name}</span>
                      {' — '}
                      {r.emailSent && <span className="text-emerald-700">email ✓</span>}
                      {r.emailSent && r.smsSent && ' · '}
                      {r.smsSent && <span className="text-emerald-700">SMS ✓</span>}
                      {!r.emailSent && !r.smsSent && (
                        <span className="text-red-600">non notifié</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                <Phone className="w-4 h-4" />
                Contact téléphonique recommandé
              </div>
              {referents.map(r => (
                <p key={r.id} className="text-sm text-amber-900">
                  {r.priority}. {r.firstName} {r.lastName} —{' '}
                  {r.email ? (
                    <a href={`mailto:${r.email}`} className="underline">{r.email}</a>
                  ) : (
                    <span className="text-slate-500">pas d&apos;email</span>
                  )}{' '}
                  — <a href={`tel:${r.phone}`} className="underline font-medium">{r.phone}</a>
                </p>
              ))}
            </div>
          </div>

          <Button className="mt-6" onClick={() => { setDeclared(false); setDescription(''); setNotifyResult(null) }}>
            Retour
          </Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="owner" title="Déclarer une urgence">
      <div className="max-w-lg mx-auto">
        <Card padding="lg" className="border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6 text-red-600">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Déclarer une urgence</h2>
              <p className="text-sm text-red-500">
                Envoie un email (et un SMS si configuré) à tous vos référents, puis crée une mission d&apos;urgence.
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
              <p className="text-sm font-medium text-slate-700 mb-2">Référents qui seront notifiés :</p>
              {referents.length === 0 ? (
                <p className="text-sm text-red-500">Aucun référent enregistré — ajoutez-en dans votre espace.</p>
              ) : (
                referents.map(r => (
                  <p key={r.id} className="text-sm text-slate-600">
                    {r.priority}. {r.firstName} {r.lastName}
                    {r.email ? ` — ${r.email}` : ' — (pas d\'email)'}
                    {r.phone ? ` — ${r.phone}` : ' — (pas de tél.)'}
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
              Déclencher l&apos;alerte d&apos;urgence
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
