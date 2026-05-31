import { useState } from 'react'
import { Calendar, MapPin, Clock, Save } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'

const allDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function AvailabilityPage() {
  const { petSitterProfile, updatePetSitterProfile } = useApp()
  const [days, setDays] = useState<string[]>(petSitterProfile?.availableDays || [])
  const [hours, setHours] = useState(petSitterProfile?.availableHours || '')
  const [area, setArea] = useState(petSitterProfile?.serviceArea || '')
  const [saved, setSaved] = useState(false)

  const toggleDay = (day: string) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSave = () => {
    updatePetSitterProfile({ availableDays: days, availableHours: hours, serviceArea: area })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout variant="petsitter" title="Disponibilités">
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Jours disponibles</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allDays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${days.includes(day) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Horaires</h3>
          </div>
          <Input label="Plage horaire" placeholder="Ex: 8h - 20h" value={hours} onChange={e => setHours(e.target.value)} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Zone géographique</h3>
          </div>
          <Input label="Zone d'intervention" placeholder="Ex: Paris intra-muros" value={area} onChange={e => setArea(e.target.value)} />
        </Card>

        <Button icon={Save} onClick={handleSave}>{saved ? 'Enregistré !' : 'Enregistrer'}</Button>
      </div>
    </DashboardLayout>
  )
}
