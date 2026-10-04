import { createHash } from 'node:crypto'

export type ParcelSizeId = 'petit' | 'moyen' | 'grand'

export type ParcelSizeDef = {
  id: ParcelSizeId
  label: string
  mrAction: 'SMA' | '24R' | '24L'
  priceCents: number
  maxWeightKg: number
  dimensionsCm: { length: number; width: number; depth: number }
}

/** Aligné avec src/lib/shop/mondial-relay.ts */
export const PARCEL_SIZES: ParcelSizeDef[] = [
  {
    id: 'petit',
    label: 'Petit colis',
    mrAction: 'SMA',
    priceCents: 390,
    maxWeightKg: 3,
    dimensionsCm: { length: 30, width: 20, depth: 15 },
  },
  {
    id: 'moyen',
    label: 'Moyen colis',
    mrAction: '24R',
    priceCents: 490,
    maxWeightKg: 10,
    dimensionsCm: { length: 40, width: 30, depth: 25 },
  },
  {
    id: 'grand',
    label: 'Grand colis',
    mrAction: '24L',
    priceCents: 690,
    maxWeightKg: 25,
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

export function getParcelSize(id: string | undefined | null): ParcelSizeDef | undefined {
  if (!id) return undefined
  return PARCEL_SIZES.find(p => p.id === id)
}

export function isValidParcelSizeId(id: unknown): id is ParcelSizeId {
  return id === 'petit' || id === 'moyen' || id === 'grand'
}

const PARCEL_RANK: Record<ParcelSizeId, number> = { petit: 0, moyen: 1, grand: 2 }

export function maxParcelSize(ids: Array<ParcelSizeId | string | undefined | null>): ParcelSizeId {
  let max: ParcelSizeId = 'petit'
  for (const id of ids) {
    const size: ParcelSizeId = isValidParcelSizeId(id) ? id : 'petit'
    if (PARCEL_RANK[size] > PARCEL_RANK[max]) max = size
  }
  return max
}

/** Clés Dual Carrier (Connect API V2) — génération d’étiquettes. */
export function getConnectApiCredentials(): { apiKey: string; apiSecret: string } | null {
  const apiKey = process.env.MONDIAL_RELAY_API_KEY?.trim()
  const apiSecret = process.env.MONDIAL_RELAY_API_SECRET?.trim()
  if (!apiKey || !apiSecret) return null
  return { apiKey, apiSecret }
}

/** Paramètres SOAP API1 — recherche Point Relais® (page Webservices Connect). */
export function getSoapCredentials(): { enseigne: string; privateKey: string; brandCode?: string } | null {
  const enseigne = process.env.MONDIAL_RELAY_ENSEIGNE?.trim()
  const privateKey = process.env.MONDIAL_RELAY_PRIVATE_KEY?.trim()
  if (!enseigne || !privateKey) return null
  const brandCode = process.env.MONDIAL_RELAY_BRAND_CODE?.trim() || undefined
  return { enseigne, privateKey, brandCode }
}

export function isRelaySearchConfigured(): boolean {
  return getSoapCredentials() !== null
}

function md5Upper(input: string): string {
  return createHash('md5').update(input, 'utf8').digest('hex').toUpperCase()
}

function xmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = xml.match(re)
  return m?.[1]?.trim() ?? ''
}

function parseHours(xmlBlock: string): string {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const
  const parts: string[] = []
  for (const day of days) {
    const open1 = xmlTag(xmlBlock, `${day}_Deb`)
    const close1 = xmlTag(xmlBlock, `${day}_Fin`)
    if (open1 && close1 && open1 !== '0000') {
      const fmt = (t: string) => (t.length === 4 ? `${t.slice(0, 2)}:${t.slice(2)}` : t)
      parts.push(`${day.slice(0, 3)} ${fmt(open1)}–${fmt(close1)}`)
    }
  }
  return parts.slice(0, 3).join(' · ')
}

function parseRelayPoints(soapXml: string): RelayPoint[] {
  const blocks = soapXml.match(/<PointRelais_Details>[\s\S]*?<\/PointRelais_Details>/gi) ?? []
  const points: RelayPoint[] = []

  for (const block of blocks) {
    const id = xmlTag(block, 'Num')
    if (!id) continue
    const distanceRaw = xmlTag(block, 'Distance')
    const distanceKm = distanceRaw ? Math.round((Number(distanceRaw) / 1000) * 10) / 10 : undefined
    points.push({
      id,
      name: xmlTag(block, 'LgAdr1') || `Point Relais ${id}`,
      address: [xmlTag(block, 'LgAdr3'), xmlTag(block, 'LgAdr2')].filter(Boolean).join(', '),
      city: xmlTag(block, 'Ville'),
      postalCode: xmlTag(block, 'CP'),
      country: xmlTag(block, 'Pays') || 'FR',
      distanceKm: Number.isFinite(distanceKm) ? distanceKm : undefined,
      hours: parseHours(block) || undefined,
    })
  }

  return points
}

export async function searchRelayPoints(options: {
  postalCode: string
  country?: string
  parcelSizeId?: ParcelSizeId
  radiusKm?: number
  limit?: number
}): Promise<
  | { ok: true; configured: true; points: RelayPoint[] }
  | { ok: true; configured: false; points: []; message: string }
  | { ok: false; error: string }
> {
  const creds = getSoapCredentials()
  if (!creds) {
    return {
      ok: true,
      configured: false,
      points: [],
      message:
        'Recherche Point Relais non configurée (MONDIAL_RELAY_ENSEIGNE + MONDIAL_RELAY_PRIVATE_KEY).',
    }
  }

  const cp = options.postalCode.replace(/\s/g, '').trim()
  if (!/^\d{4,5}$/.test(cp)) {
    return { ok: false, error: 'Code postal invalide' }
  }

  const pays = (options.country || 'FR').toUpperCase().slice(0, 2)
  const size = getParcelSize(options.parcelSizeId) ?? getParcelSize('moyen')!
  const action = size.mrAction
  const poids = String(Math.round(size.maxWeightKg * 1000))
  const rayon = String(options.radiusKm ?? 20)
  const nombre = String(Math.min(Math.max(options.limit ?? 15, 1), 30))

  const enseigne = creds.enseigne
  const numPoint = ''
  const ville = ''
  const latitude = ''
  const longitude = ''
  const taille = ''
  const delai = '0'
  const typeActivite = ''

  // Hash MD5 : Enseigne+Pays+Num+Ville+CP+Lat+Long+Taille+Poids+Action+Delai+Rayon+TypeActivite+Nombre+Clé
  const security = md5Upper(
    `${enseigne}${pays}${numPoint}${ville}${cp}${latitude}${longitude}${taille}${poids}${action}${delai}${rayon}${typeActivite}${nombre}${creds.privateKey}`,
  )

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${enseigne}</Enseigne>
      <Pays>${pays}</Pays>
      <NumPointRelais>${numPoint}</NumPointRelais>
      <Ville>${ville}</Ville>
      <CP>${cp}</CP>
      <Latitude>${latitude}</Latitude>
      <Longitude>${longitude}</Longitude>
      <Taille>${taille}</Taille>
      <Poids>${poids}</Poids>
      <Action>${action}</Action>
      <DelaiEnvoi>${delai}</DelaiEnvoi>
      <RayonRecherche>${rayon}</RayonRecherche>
      <TypeActivite>${typeActivite}</TypeActivite>
      <NombreResultats>${nombre}</NombreResultats>
      <Security>${security}</Security>
    </WSI4_PointRelais_Recherche>
  </soap:Body>
</soap:Envelope>`

  try {
    const response = await fetch('https://api.mondialrelay.com/Web_Services.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche',
      },
      body: soapBody,
    })

    const text = await response.text()
    if (!response.ok) {
      console.error('[Mondial Relay] SOAP HTTP', response.status, text.slice(0, 300))
      return { ok: false, error: 'Erreur réseau Mondial Relay' }
    }

    const status = xmlTag(text, 'STAT')
    if (status && status !== '0') {
      console.error('[Mondial Relay] STAT', status)
      return { ok: false, error: `Mondial Relay a refusé la recherche (code ${status})` }
    }

    return { ok: true, configured: true, points: parseRelayPoints(text) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Mondial Relay'
    console.error('[Mondial Relay]', message)
    return { ok: false, error: message }
  }
}
