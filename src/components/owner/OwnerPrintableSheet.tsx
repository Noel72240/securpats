import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DEFAULT_LOGO_ICON } from '@/components/brand/BrandLogo'
import { useApp, useOwnerPets, useOwnerReferents } from '@/contexts/AppContext'
import { getOwnerRescueUrl } from '@/lib/utils'
import type { Pet } from '@/types'

function clip(text: string, max: number): string {
  const t = text.trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

function PetPhoto({ pet, className }: { pet: Pet; className?: string }) {
  if (pet.photo) {
    return <img src={pet.photo} alt={pet.name} className={className} />
  }
  return (
    <div className={`owner-id-card__photo-fallback ${className ?? ''}`} aria-hidden>
      🐾
    </div>
  )
}

export function OwnerPrintableSheet({ showActions = true }: { showActions?: boolean }) {
  const { currentUser } = useApp()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()

  const ownerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : ''
  const ownerQrUrl = currentUser?.qrToken ? getOwnerRescueUrl(currentUser.qrToken) : ''
  const primaryPet = pets[0]
  const petsOnCard = pets.slice(0, 2)
  const refsOnCard = referents.slice(0, 2)

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
          <header className="owner-id-card__banner">
            <img src={DEFAULT_LOGO_ICON} alt="" className="owner-id-card__banner-logo" />
            <span>SÉCURPATS — URGENCE ANIMALE</span>
          </header>

          <div className="owner-id-card__body">
            {primaryPet && (
              <div className="owner-id-card__media">
                <PetPhoto pet={primaryPet} className="owner-id-card__photo" />
                {pets.length > 1 && (
                  <span className="owner-id-card__more-pets">+{pets.length - 1}</span>
                )}
              </div>
            )}

            <div className="owner-id-card__content">
              <div className="owner-id-card__owner-block">
                <p className="owner-id-card__label">Propriétaire</p>
                <p className="owner-id-card__name">{ownerName || '—'}</p>
                {currentUser?.phone && (
                  <p className="owner-id-card__phone">{currentUser.phone}</p>
                )}
              </div>

              {petsOnCard.length > 0 && (
                <section className="owner-id-card__section">
                  <p className="owner-id-card__section-title">Animal{pets.length > 1 ? 'aux' : ''}</p>
                  <ul className="owner-id-card__pets">
                    {petsOnCard.map(pet => (
                      <li key={pet.id} className="owner-id-card__pet-row">
                        {pets.length > 1 && (
                          <PetPhoto pet={pet} className="owner-id-card__pet-thumb" />
                        )}
                        <div className="owner-id-card__pet-info">
                          <p className="owner-id-card__pet-name">
                            <strong>{clip(pet.name, 12)}</strong>
                            <span className="owner-id-card__pet-meta">
                              {' '}
                              {clip(`${pet.species}${pet.breed ? `, ${pet.breed}` : ''}`, 20)}
                            </span>
                          </p>
                          {pet.identificationNumber && (
                            <p className="owner-id-card__pet-id">
                              N°&nbsp;{clip(pet.identificationNumber, 18)}
                            </p>
                          )}
                          {pet.allergies && pet.allergies !== 'Aucune connue' && (
                            <p className="owner-id-card__alert">
                              Allergies : {clip(pet.allergies, 24)}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                    {pets.length > 2 && (
                      <li className="owner-id-card__more">+{pets.length - 2} autre(s) — scannez le QR</li>
                    )}
                  </ul>
                </section>
              )}

              {refsOnCard.length > 0 && (
                <section className="owner-id-card__section owner-id-card__section--refs">
                  <p className="owner-id-card__section-title">Référents</p>
                  <ul className="owner-id-card__list">
                    {refsOnCard.map(r => (
                      <li key={r.id}>
                        {r.priority}. {clip(`${r.firstName} ${r.lastName}`, 14)} — {r.phone}
                      </li>
                    ))}
                    {referents.length > 2 && (
                      <li className="owner-id-card__more">+{referents.length - 2} autre(s)</li>
                    )}
                  </ul>
                </section>
              )}
            </div>

            {ownerQrUrl && (
              <div className="owner-id-card__qr" aria-hidden>
                <QRCodeSVG value={ownerQrUrl} size={48} level="H" includeMargin={false} />
                <span className="owner-id-card__qr-hint">Scan</span>
              </div>
            )}
          </div>

          <footer className="owner-id-card__footer">
            <img src={DEFAULT_LOGO_ICON} alt="" className="owner-id-card__footer-logo" />
            <span>securpats.fr</span>
          </footer>
        </article>
      </div>
    </div>
  )
}
