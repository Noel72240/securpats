import { AlertTriangle, Phone, PawPrint, Loader2, Stethoscope, Pill } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router-dom'
import { useOwnerRescue } from '@/hooks/useOwnerRescue'
import { calculateAge, getOwnerRescueUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Card'
import { EmergencyTriggerPanel } from '@/components/emergency/EmergencyTriggerPanel'
import { SecurPatsUrgencyPhone } from '@/components/emergency/SecurPatsUrgencyPhone'

export default function OwnerFamilyRescuePage() {
  const { token } = useParams()
  const { bundle, loading } = useOwnerRescue(token || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Fiche non trouvée</h1>
          <p className="text-slate-500 mt-2">Ce QR Code n&apos;est pas associé à un foyer enregistré.</p>
        </div>
      </div>
    )
  }

  const ownerName = `${bundle.owner.first_name} ${bundle.owner.last_name}`.trim()

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="bg-red-600 text-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">FICHE FAMILLE — URGENCE ANIMALE</p>
            <p className="text-sm text-red-100">Propriétaire : {ownerName || '—'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <SecurPatsUrgencyPhone />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
          <p className="text-sm text-slate-500 mb-1">Propriétaire</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{ownerName || '—'}</h1>
          {token && (
            <div className="mt-4 inline-block p-3 bg-white rounded-xl border border-slate-200">
              <QRCodeSVG value={getOwnerRescueUrl(token)} size={88} level="H" />
            </div>
          )}
        </div>

        {bundle.pets.length === 0 ? (
          <div className="bg-white rounded-2xl border p-4 text-sm text-slate-500 text-center">
            Aucun animal enregistré.
          </div>
        ) : bundle.pets.map(pet => (
          <div key={pet.qr_token} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <div className="flex items-start gap-4">
              {pet.photo ? (
                <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">🐾</div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{pet.name}</h2>
                <p className="text-slate-600 text-sm">{pet.species} — {pet.breed}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge>{pet.sex}</Badge>
                  {pet.birth_date && <Badge variant="info">{calculateAge(pet.birth_date)}</Badge>}
                  {pet.weight > 0 && <Badge variant="default">{pet.weight} kg</Badge>}
                </div>
              </div>
            </div>

            {pet.allergies && pet.allergies !== 'Aucune connue' && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-800">
                <strong>Allergies :</strong> {pet.allergies}
              </div>
            )}
            {pet.treatments && (
              <p className="text-sm text-slate-600"><Pill className="w-4 h-4 inline mr-1 text-brand-600" />{pet.treatments}</p>
            )}
            {pet.special_instructions && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">{pet.special_instructions}</p>
            )}
            {(pet.vet_name || pet.vet_phone) && (
              <div className="text-sm border-t border-slate-100 pt-3">
                <p className="font-medium flex items-center gap-1"><Stethoscope className="w-4 h-4 text-brand-600" />{pet.vet_name}</p>
                {pet.vet_phone && (
                  <a href={`tel:${pet.vet_phone}`} className="text-brand-600 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />{pet.vet_phone}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        <EmergencyTriggerPanel
          tokenType="owner"
          token={token || ''}
          petName={bundle.pets[0]?.name}
          referentsCount={bundle.referents.length}
        />

        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Référents prioritaires</h3>
          {bundle.referents.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun référent enregistré.</p>
          ) : (
            bundle.referents.map((r, i) => (
              <div key={`${r.priority}-${i}`} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">{r.priority}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{r.first_name} {r.last_name}</p>
                  <a href={`tel:${r.phone}`} className="text-sm text-brand-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{r.phone}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center py-2 space-y-2">
          <SecurPatsUrgencyPhone compact />
          <p className="text-xs text-slate-400">SécurPats — Protection animale d&apos;urgence</p>
        </div>
      </div>
    </div>
  )
}
