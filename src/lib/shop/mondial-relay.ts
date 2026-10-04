/** Tailles de colis Mondial Relay (Point Relais®) — boutique SécurPats. */

export type ParcelSizeId = 'petit' | 'moyen' | 'grand'

export type ParcelSize = {
  id: ParcelSizeId
  label: string
  description: string
  /** Poids max indicatif (kg). */
  maxWeightKg: number
  /** Action SOAP WSI4 (filtre Points Relais). */
  mrAction: 'SMA' | '24R' | '24L'
  /** Prix livraison hors seuil « offerte ». */
  priceCents: number
  /** Dimensions de référence pour étiquette Dual Carrier (cm). */
  dimensionsCm: { length: number; width: number; depth: number }
}

export const PARCEL_SIZES: ParcelSize[] = [
  {
    id: 'petit',
    label: 'Petit colis',
    description: 'Jusqu’à 3 kg · longueur ≤ 40 cm · développé ≤ 80 cm',
    maxWeightKg: 3,
    mrAction: 'SMA',
    priceCents: 390,
    dimensionsCm: { length: 30, width: 20, depth: 15 },
  },
  {
    id: 'moyen',
    label: 'Moyen colis',
    description: 'Jusqu’à 10 kg · Point Relais® standard (max 25 kg / 38×41×64)',
    maxWeightKg: 10,
    mrAction: '24R',
    priceCents: 490,
    dimensionsCm: { length: 40, width: 30, depth: 25 },
  },
  {
    id: 'grand',
    label: 'Grand colis',
    description: 'Jusqu’à 25 kg · Point Relais® XL',
    maxWeightKg: 25,
    mrAction: '24L',
    priceCents: 690,
    dimensionsCm: { length: 60, width: 40, depth: 40 },
  },
]

export type RelayPoint = {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  distanceKm?: number
  hours?: string
}

export function getParcelSize(id: string | undefined | null): ParcelSize | undefined {
  if (!id) return undefined
  return PARCEL_SIZES.find(p => p.id === id)
}

export function shippingCentsForParcel(
  subtotalCents: number,
  parcelSizeId: ParcelSizeId | undefined,
  freeFromCents: number,
): number {
  if (subtotalCents <= 0) return 0
  if (subtotalCents >= freeFromCents) return 0
  const size = getParcelSize(parcelSizeId) ?? getParcelSize('moyen')!
  return size.priceCents
}

export function orderTotalWithParcel(
  subtotalCents: number,
  parcelSizeId: ParcelSizeId | undefined,
  freeFromCents: number,
): number {
  return subtotalCents + shippingCentsForParcel(subtotalCents, parcelSizeId, freeFromCents)
}

const PARCEL_RANK: Record<ParcelSizeId, number> = { petit: 0, moyen: 1, grand: 2 }

export function isValidParcelSizeId(id: unknown): id is ParcelSizeId {
  return id === 'petit' || id === 'moyen' || id === 'grand'
}

/** Plus grande taille parmi une liste (ex. articles du panier). */
export function maxParcelSize(ids: Array<ParcelSizeId | string | undefined | null>): ParcelSizeId {
  let max: ParcelSizeId = 'petit'
  for (const id of ids) {
    const size: ParcelSizeId = isValidParcelSizeId(id) ? id : 'petit'
    if (PARCEL_RANK[size] > PARCEL_RANK[max]) max = size
  }
  return max
}
