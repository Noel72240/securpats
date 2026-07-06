import { AlertTriangle, Phone, MapPin, Pill, Stethoscope, PawPrint, Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useRescuePet } from '@/hooks/useRescuePet'
import { getRescueUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Card'
import { calculateAge } from '@/lib/utils'
import { useParams } from 'react-router-dom'
import { EmergencyTriggerPanel } from '@/components/emergency/EmergencyTriggerPanel'
import { SecurPatsUrgencyPhone } from '@/components/emergency/SecurPatsUrgencyPhone'

export default function RescuePage() {
  const { token } = useParams()
  const { pet, referents: petReferents, loading } = useRescuePet(token || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Fiche non trouvée</h1>
          <p className="text-slate-500 mt-2">Ce QR Code n'est pas associé à un animal enregistré.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="bg-red-600 text-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">FICHE DE SECOURS — URGENCE ANIMALE</p>
            <p className="text-sm text-red-100">Informations essentielles — SécurPats</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SecurPatsUrgencyPhone />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
          {pet.photo && (
            <img src={pet.photo} alt={pet.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-4 border-white shadow-md" />
          )}
          <h1 className="text-3xl font-extrabold text-slate-900">{pet.name}</h1>
          <p className="text-slate-600">{pet.species} — {pet.breed}</p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge>{pet.sex}</Badge>
            <Badge variant="info">{calculateAge(pet.birthDate)}</Badge>
            <Badge variant="default">{pet.weight} kg</Badge>
          </div>
        </div>

        {pet.allergies && pet.allergies !== 'Aucune connue' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" /> ALLERGIES
            </div>
            <p className="text-sm text-red-800 whitespace-pre-line">{pet.allergies}</p>
          </div>
        )}

        {pet.treatments && (
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
              <Pill className="w-5 h-5 text-brand-600" /> Traitements en cours
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-line">{pet.treatments}</p>
          </div>
        )}

        {pet.specialInstructions && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-semibold text-amber-800 mb-2">
              <AlertTriangle className="w-5 h-5" /> Consignes importantes
            </div>
            <p className="text-sm text-amber-900 whitespace-pre-line">{pet.specialInstructions}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Référents prioritaires</h3>
          {petReferents.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun référent enregistré.</p>
          ) : (
            petReferents.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">{r.priority}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{r.firstName} {r.lastName}</p>
                  <a href={`tel:${r.phone}`} className="text-sm text-brand-600 flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</a>
                </div>
              </div>
            ))
          )}
        </div>

        <EmergencyTriggerPanel
          tokenType="pet"
          token={token || ''}
          petName={pet.name}
          referentsCount={petReferents.length}
        />

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
            <Stethoscope className="w-5 h-5 text-brand-600" /> Vétérinaire
          </div>
          <p className="font-medium text-sm">{pet.vetName}</p>
          <a href={`tel:${pet.vetPhone}`} className="text-sm text-brand-600 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{pet.vetPhone}</a>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{pet.vetAddress}</p>
        </div>

        <div className="text-center py-4 space-y-2">
          <QRCodeSVG value={getRescueUrl(pet.qrToken)} size={80} level="H" className="mx-auto" />
          <SecurPatsUrgencyPhone compact />
          <p className="text-xs text-slate-400">SécurPats — Protection animale d'urgence</p>
        </div>
      </div>
    </div>
  )
}
