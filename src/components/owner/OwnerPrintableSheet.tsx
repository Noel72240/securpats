import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, Phone, Stethoscope, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApp, useOwnerPets, useOwnerReferents } from '@/contexts/AppContext'
import { calculateAge, getOwnerRescueUrl } from '@/lib/utils'

export function OwnerPrintableSheet({ showActions = true }: { showActions?: boolean }) {
  const { currentUser } = useApp()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()

  const ownerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : ''
  const ownerQrUrl = currentUser?.qrToken ? getOwnerRescueUrl(currentUser.qrToken) : ''

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex justify-center no-print">
          <Button icon={Download} onClick={() => window.print()}>Imprimer la fiche</Button>
        </div>
      )}

      <div className="owner-print-sheet bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 print:border print:rounded-none print:shadow-none">
        <div className="flex items-center gap-2 mb-6 text-red-600 border-b border-red-100 pb-4">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-lg leading-tight">FICHE D&apos;URGENCE — FOYER</p>
            <p className="text-sm text-red-700/80">SécurPats — À conserver visible en cas d&apos;urgence</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8 pb-6 border-b border-slate-100">
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Propriétaire</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{ownerName || '—'}</h2>
            {currentUser?.phone && (
              <p className="text-slate-600 mt-2 flex items-center justify-center sm:justify-start gap-1">
                <Phone className="w-4 h-4" />{currentUser.phone}
              </p>
            )}
          </div>
          {ownerQrUrl && (
            <div className="text-center shrink-0">
              <div className="p-3 bg-white rounded-xl border-2 border-slate-200 inline-block">
                <QRCodeSVG value={ownerQrUrl} size={120} level="H" includeMargin />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 max-w-[140px]">Scannez pour la fiche numérique complète</p>
            </div>
          )}
        </div>

        <section className="mb-8">
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Animaux ({pets.length})</h3>
          {pets.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun animal enregistré.</p>
          ) : (
            <div className="space-y-4">
              {pets.map(pet => (
                <div key={pet.id} className="pet-print-block border border-slate-200 rounded-xl p-4 break-inside-avoid">
                  <div className="flex gap-4">
                    {pet.photo ? (
                      <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-brand-50 flex items-center justify-center text-2xl shrink-0">🐾</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-slate-900">{pet.name}</h4>
                      <p className="text-sm text-slate-600">{pet.species} — {pet.breed} — {pet.sex}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {pet.birthDate ? `${calculateAge(pet.birthDate)}` : ''}
                        {pet.weight > 0 ? ` · ${pet.weight} kg` : ''}
                        {pet.color ? ` · ${pet.color}` : ''}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {pet.allergies && (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-red-700">Allergies</dt>
                        <dd className="text-slate-700">{pet.allergies}</dd>
                      </div>
                    )}
                    {pet.treatments && (
                      <div>
                        <dt className="font-semibold text-slate-600">Traitements</dt>
                        <dd className="text-slate-700 whitespace-pre-line">{pet.treatments}</dd>
                      </div>
                    )}
                    {pet.diet && (
                      <div>
                        <dt className="font-semibold text-slate-600">Alimentation</dt>
                        <dd className="text-slate-700 whitespace-pre-line">{pet.diet}</dd>
                      </div>
                    )}
                    {pet.specialInstructions && (
                      <div className="sm:col-span-2">
                        <dt className="font-semibold text-amber-800">Consignes</dt>
                        <dd className="text-slate-700 whitespace-pre-line">{pet.specialInstructions}</dd>
                      </div>
                    )}
                    {(pet.vetName || pet.vetPhone) && (
                      <div className="sm:col-span-2 flex items-start gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
                        <div>
                          <dt className="font-semibold text-slate-600">Vétérinaire</dt>
                          <dd className="text-slate-700">{pet.vetName} — {pet.vetPhone}</dd>
                        </div>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Référents</h3>
          {referents.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun référent enregistré.</p>
          ) : (
            <div className="space-y-2">
              {referents.map(r => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 break-inside-avoid">
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {r.priority}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{r.firstName} {r.lastName}</p>
                    <p className="text-brand-700">{r.phone}</p>
                    {r.address && <p className="text-slate-500 text-xs">{r.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-[10px] text-slate-400 text-center mt-8 pt-4 border-t border-slate-100">
          SécurPats — securpats.fr — Document généré automatiquement
        </p>
      </div>
    </div>
  )
}
