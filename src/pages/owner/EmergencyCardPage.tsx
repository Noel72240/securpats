import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, CreditCard, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useOwnerPets } from '@/contexts/AppContext'
import { getRescueUrl } from '@/lib/utils'

export default function EmergencyCardPage() {
  const pets = useOwnerPets()
  const [selectedId, setSelectedId] = useState(pets[0]?.id || '')
  const cardRef = useRef<HTMLDivElement>(null)
  const pet = pets.find(p => p.id === selectedId)

  const exportPDF = () => {
    window.print()
  }

  if (pets.length === 0) {
    return (
      <DashboardLayout variant="owner" title="Carte d'urgence">
        <Card><EmptyState icon={CreditCard} title="Aucun animal" description="Ajoutez un animal pour créer sa carte d'urgence." /></Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="owner" title="Carte d'urgence">
      <div className="max-w-2xl mx-auto space-y-6">
        <Select
          label="Sélectionner un animal"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          options={pets.map(p => ({ value: p.id, label: p.name }))}
        />

        {pet && (
          <>
            <div ref={cardRef} className="print-only" />
            <Card padding="lg" className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50">
              <div className="flex items-center gap-2 mb-6 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-bold text-lg">CARTE D'URGENCE — ANIMAL À PROTÉGER</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {pet.photo ? (
                  <img src={pet.photo} alt={pet.name} className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-brand-100 flex items-center justify-center text-4xl">🐾</div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900">{pet.name}</h2>
                  <p className="text-slate-600">{pet.species} — {pet.breed}</p>
                  <p className="text-sm text-slate-500 mt-1">ID: {pet.identificationNumber}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <QRCodeSVG value={getRescueUrl(pet.qrToken)} size={100} level="H" />
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-800 font-medium text-center">
                  ⚠️ En cas d'urgence, scannez le QR Code ou contactez les référents indiqués sur la fiche de secours SécurPats.
                </p>
              </div>

              <p className="text-xs text-slate-400 text-center mt-4">SécurPats — securpats.fr</p>
            </Card>

            <div className="flex justify-center no-print">
              <Button icon={Download} onClick={exportPDF}>Exporter en PDF</Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
