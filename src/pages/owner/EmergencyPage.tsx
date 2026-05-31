import { useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, Send } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select, Textarea } from '@/components/ui/Input'
import { useOwnerPets, useOwnerReferents, useApp } from '@/contexts/AppContext'

export default function EmergencyPage() {
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const { declareEmergency } = useApp()
  const [petId, setPetId] = useState(pets[0]?.id || '')
  const [description, setDescription] = useState('')
  const [declared, setDeclared] = useState(false)
  const [step, setStep] = useState(0)

  const handleDeclare = () => {
    declareEmergency(petId, description)
    setDeclared(true)
    setStep(0)
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= 3) { clearInterval(interval); return s }
        return s + 1
      })
    }, 1500)
  }

  if (declared) {
    return (
      <DashboardLayout variant="owner" title="Urgence déclarée">
        <Card padding="lg" className="max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Urgence déclarée avec succès</h2>
          <div className="space-y-3 mt-6 text-left">
            {[
              { label: 'Notification référents', done: step >= 1 },
              { label: 'Notification Pet-Sitter', done: step >= 2 },
              { label: 'Mission d\'urgence créée', done: step >= 3 },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${s.done ? 'bg-brand-50' : 'bg-slate-50'}`}>
                <Bell className={`w-5 h-5 ${s.done ? 'text-brand-600' : 'text-slate-300'}`} />
                <span className={`text-sm ${s.done ? 'text-brand-700 font-medium' : 'text-slate-400'}`}>{s.label}</span>
                {s.done && <CheckCircle className="w-4 h-4 text-brand-500 ml-auto" />}
              </div>
            ))}
          </div>
          <Button className="mt-6" onClick={() => setDeclared(false)}>Retour</Button>
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
              <p className="text-sm text-red-500">Cette action alertera vos référents et les pet-sitters disponibles.</p>
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
              {referents.map(r => (
                <p key={r.id} className="text-sm text-slate-600">{r.priority}. {r.firstName} {r.lastName} — {r.phone}</p>
              ))}
            </div>

            <Button variant="danger" icon={Send} className="w-full" onClick={handleDeclare} disabled={!description}>
              Déclencher l'alerte d'urgence
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
