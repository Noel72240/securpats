import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DEFAULT_LOGO_ICON } from '@/components/brand/BrandLogo'
import { useApp, useOwnerPets, useOwnerReferents } from '@/contexts/AppContext'
import { getOwnerRescueUrl } from '@/lib/utils'
import type { Pet } from '@/types'

type CardDensity = 'comfortable' | 'normal' | 'compact'

type PetDetailLine = {
  key: string
  text: string
  variant?: 'alert'
}

const QR_SIZE: Record<CardDensity, number> = {
  comfortable: 50,
  normal: 46,
  compact: 40,
}

function getPetDetailLines(pet: Pet): PetDetailLine[] {
  const lines: PetDetailLine[] = []

  if (pet.allergies && pet.allergies !== 'Aucune connue') {
    lines.push({ key: 'allergies', text: `⚠ Allergies : ${pet.allergies}`, variant: 'alert' })
  }
  if (pet.treatments?.trim()) {
    lines.push({ key: 'treatments', text: `Traitement : ${pet.treatments.trim()}` })
  }
  if (pet.specialInstructions?.trim()) {
    lines.push({ key: 'instructions', text: `Consignes : ${pet.specialInstructions.trim()}` })
  }
  if (pet.diet?.trim()) {
    lines.push({ key: 'diet', text: `Alimentation : ${pet.diet.trim()}` })
  }

  const vetParts = [pet.vetName?.trim(), pet.vetPhone?.trim()].filter(Boolean)
  if (vetParts.length > 0) {
    lines.push({ key: 'vet', text: `Vét. : ${vetParts.join(' — ')}` })
  }

  return lines
}

function getCardDensity(
  pet: Pet | undefined,
  petLines: PetDetailLine[],
  referentCount: number,
  extraPets: number,
): CardDensity {
  let score = referentCount + petLines.length
  if (pet?.identificationNumber) score += 0.5
  if (pet?.breed) score += 0.5
  if (extraPets > 0) score += 1

  if (score <= 4) return 'comfortable'
  if (score <= 7) return 'normal'
  return 'compact'
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
  const petDetailLines = primaryPet ? getPetDetailLines(primaryPet) : []
  const sortedReferents = [...referents].sort((a, b) => a.priority - b.priority)
  const density = getCardDensity(primaryPet, petDetailLines, sortedReferents.length, pets.length - 1)
  const stackIdentity = petDetailLines.length >= 2 || density === 'compact'

  return (
    <div className="owner-id-card-print-root">
      {showActions && (
        <div className="owner-id-card-actions no-print">
          <Button icon={Download} onClick={() => window.print()}>Imprimer la carte</Button>
          <p className="text-xs text-slate-500 text-center mt-3 max-w-md mx-auto">
            Format carte d&apos;identité ISO (85,6 × 54 mm). Le contenu s&apos;adapte
            automatiquement selon vos animaux et référents. À l&apos;impression, choisissez
            «&nbsp;Taille réelle&nbsp;» et désactivez les marges.
          </p>
        </div>
      )}

      <div className="owner-id-card-wrap">
        <article
          className={`owner-id-card owner-id-card--${density}`}
          aria-label="Carte d'urgence SécurPats"
        >
          <header className="owner-id-card__banner">
            <img src={DEFAULT_LOGO_ICON} alt="" className="owner-id-card__banner-logo" />
            <span>SÉCURPATS — URGENCE ANIMALE</span>
          </header>

          <div className="owner-id-card__body">
            {primaryPet && (
              <div className="owner-id-card__media">
                <PetPhoto pet={primaryPet} className="owner-id-card__photo" />
                {pets.length > 1 && (
                  <span className="owner-id-card__more-pets">+{pets.length - 1} animaux</span>
                )}
              </div>
            )}

            <div className="owner-id-card__main">
              <div className="owner-id-card__head">
                <div
                  className={`owner-id-card__identity${stackIdentity ? ' owner-id-card__identity--stacked' : ''}`}
                >
                  <div className="owner-id-card__owner-block">
                    <p className="owner-id-card__label">Propriétaire</p>
                    <p className="owner-id-card__name">{ownerName || '—'}</p>
                    {currentUser?.phone && (
                      <p className="owner-id-card__phone">{currentUser.phone}</p>
                    )}
                  </div>

                  {primaryPet && (
                    <div className="owner-id-card__pet-block">
                      <p className="owner-id-card__label">Animal</p>
                      <p className="owner-id-card__pet-title">{primaryPet.name}</p>
                      <p className="owner-id-card__pet-sub">
                        {primaryPet.species}
                        {primaryPet.breed ? ` · ${primaryPet.breed}` : ''}
                      </p>
                      {primaryPet.identificationNumber && (
                        <p className="owner-id-card__pet-id">
                          N°&nbsp;{primaryPet.identificationNumber}
                        </p>
                      )}
                      {petDetailLines.length > 0 && (
                        <ul className="owner-id-card__pet-details">
                          {petDetailLines.map(line => (
                            <li
                              key={line.key}
                              className={
                                line.variant === 'alert'
                                  ? 'owner-id-card__alert'
                                  : 'owner-id-card__pet-detail'
                              }
                            >
                              {line.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {ownerQrUrl && (
                  <div className="owner-id-card__qr" aria-hidden>
                    <div className="owner-id-card__qr-frame">
                      <QRCodeSVG
                        value={ownerQrUrl}
                        size={QR_SIZE[density]}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <span className="owner-id-card__qr-hint">Scanner</span>
                  </div>
                )}
              </div>

              {sortedReferents.length > 0 && (
                <section className="owner-id-card__refs-box">
                  <p className="owner-id-card__section-title">Référents</p>
                  <ul className="owner-id-card__list">
                    {sortedReferents.map(r => (
                      <li key={r.id}>
                        <span className="owner-id-card__ref-num">{r.priority}</span>
                        <span className="owner-id-card__ref-name">
                          {`${r.firstName} ${r.lastName}`.trim()}
                        </span>
                        <span className="owner-id-card__ref-phone">{r.phone}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
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
