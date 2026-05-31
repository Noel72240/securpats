import { useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, Send, Mail, Phone, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import { useOwnerPets, useOwnerReferents, useApp } from '@/contexts/AppContext'

type NotifyResult = {
  ok: boolean
  emailsSent: number
  error?: string
  emailConfigured?: boolean
}

export default function EmergencyPage() {
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const { declareEmergency } = useApp()
  const [petId, setPetId] = useState(pets[0]?.id || '')
  const [description, setDescription] = useState('')
  const [declared, setDeclared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifyResult, setNotifyResult] = useState<NotifyResult | null>(null)

  const handleDeclare = async () => {
    if (!petId || !description.trim()) return

    const referentsSansEmail = referents.filter(r => !r.email?.trim())
    if (referentsSansEmail.length > 0) {
      alert(`Ajoutez une adresse email pour : ${referentsSansEmail.map(r => r.firstName).join(', ')} (menu Référents).`)
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
    return (
      <DashboardLayout variant="owner" title="Urgence déclarée">
        <Card padding="lg" className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Urgence déclarée pour {pet?.name}</h2>
          <p className="text-sm text-slate-600 mb-6">Mission d&apos;urgence créée et référents alertés.</p>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50">
              <Bell className="w-5 h-5 text-brand-600" />
              <span className="text-sm text-brand-700 font-medium">Mission d&apos;urgence enregistrée</span>
              <CheckCircle className="w-4 h-4 text-brand-500 ml-auto" />
            </div>

            <div className={`p-3 rounded-xl ${notifyResult?.emailsSent ? 'bg-brand-50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <Mail className={`w-5 h-5 flex-shrink-0 ${notifyResult?.emailsSent ? 'text-brand-600' : 'text-slate-400'}`} />
                <span className="text-sm">
                  {notifyResult?.emailConfigured === false
                    ? 'Emails non configurés sur le serveur — contactez vos référents par téléphone.'
                    : notifyResult?.emailsSent
                      ? `${notifyResult.emailsSent} email(s) envoyé(s) aux référents`
                      : 'Aucun email envoyé'}
                </span>
              </div>
              {notifyResult?.error && !notifyResult.emailsSent && (
                <p className="text-xs text-red-600 mt-2 ml-8 break-words">{notifyResult.error}</p>
              )}
            </div>

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
                    <span className="text-red-600 font-medium">email manquant</span>
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
              <p className="text-sm text-red-500">Cette action enverra un email à vos référents et créera une mission d&apos;urgence.</p>
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
              <p className="text-sm font-medium text-slate-700 mb-2">Référents qui seront notifiés par email :</p>
              {referents.length === 0 ? (
                <p className="text-sm text-red-500">Aucun référent enregistré — ajoutez-en dans votre espace.</p>
              ) : (
                referents.map(r => (
                  <p key={r.id} className="text-sm text-slate-600">
                    {r.priority}. {r.firstName} {r.lastName} — {r.email || '(email manquant)'} — {r.phone}
                  </p>
                ))
              )}
            </div>

            <Button
              variant="danger"
              icon={loading ? Loader2 : Send}
              className="w-full"
              onClick={handleDeclare}
              disabled={!description.trim() || !petId || referents.length === 0}
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
