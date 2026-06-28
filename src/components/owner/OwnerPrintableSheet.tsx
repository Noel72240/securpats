import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useApp, useOwnerPets, useOwnerReferents } from '@/contexts/AppContext'
import { getOwnerRescueUrl } from '@/lib/utils'

function clip(text: string, max: number): string {
  const t = text.trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

export function OwnerPrintableSheet({ showActions = true }: { showActions?: boolean }) {
  const { currentUser } = useApp()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()

  const ownerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : ''
  const ownerQrUrl = currentUser?.qrToken ? getOwnerRescueUrl(currentUser.qrToken) : ''
  const petsOnCard = pets.slice(0, 3)
  const refsOnCard = referents.slice(0, 3)

  return (
    <div className="owner-id-card-print-root">
      {showActions && (
        <div className="owner-id-card-actions no-print">
          <Button icon={Download} onClick={() => window.print()}>Imprimer la carte</Button>
          <p className="text-xs text-slate-500 text-center mt-3 max-w-md mx-auto">
            Format carte d&apos;identité ISO (85,6 × 54 mm). À l&apos;impression, choisissez
            «&nbsp;Taille réelle&nbsp;» et désactivez les marges pour un rendu exact.
          </p>
        </div>
      )}

      <div className="owner-id-card-wrap">
        <article className="owner-id-card" aria-label="Carte d'urgence SécurPats">
          <header className="owner-id-card__banner">SÉCURPATS — URGENCE ANIMALE</header>

          <div className="owner-id-card__body">
            <div className="owner-id-card__content">
              <p className="owner-id-card__label">Propriétaire</p>
              <p className="owner-id-card__name">{ownerName || '—'}</p>
              {currentUser?.phone && (
                <p className="owner-id-card__phone">{currentUser.phone}</p>
              )}

              {petsOnCard.length > 0 && (
                <section className="owner-id-card__section">
                  <p className="owner-id-card__section-title">Animaux</p>
                  <ul className="owner-id-card__list">
                    {petsOnCard.map(pet => (
                      <li key={pet.id}>
                        <strong>{clip(pet.name, 14)}</strong>
                        {' · '}
                        {clip(`${pet.species}${pet.breed ? `, ${pet.breed}` : ''}`, 22)}
                        {pet.allergies && pet.allergies !== 'Aucune connue' && (
                          <span className="owner-id-card__alert"> — Allergies : {clip(pet.allergies, 28)}</span>
                        )}
                        {pet.treatments && (
                          <span> — {clip(pet.treatments.replace(/\s+/g, ' '), 32)}</span>
                        )}
                      </li>
                    ))}
                    {pets.length > 3 && (
                      <li className="owner-id-card__more">+{pets.length - 3} autre(s) — scannez le QR</li>
                    )}
                  </ul>
                </section>
              )}

              {refsOnCard.length > 0 && (
                <section className="owner-id-card__section">
                  <p className="owner-id-card__section-title">Référents</p>
                  <ul className="owner-id-card__list">
                    {refsOnCard.map(r => (
                      <li key={r.id}>
                        {r.priority}. {clip(`${r.firstName} ${r.lastName}`, 18)} — {r.phone}
                      </li>
                    ))}
                    {referents.length > 3 && (
                      <li className="owner-id-card__more">+{referents.length - 3} autre(s)</li>
                    )}
                  </ul>
                </section>
              )}
            </div>

            {ownerQrUrl && (
              <div className="owner-id-card__qr" aria-hidden>
                <QRCodeSVG value={ownerQrUrl} size={52} level="H" includeMargin={false} />
                <span className="owner-id-card__qr-hint">Scan</span>
              </div>
            )}
          </div>

          <footer className="owner-id-card__footer">securpats.fr</footer>
        </article>
      </div>
    </div>
  )
}
