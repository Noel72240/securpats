export type ShopCategoryId =
  | 'identification-securite'
  | 'promenade-transport'
  | 'repas-hydratation'
  | 'jeux-occupation'
  | 'confort-accessoires'
  | 'kits-securpats'
  | 'produits-numeriques'

/** Anciennes catégories (migration / données legacy). */
const LEGACY_CATEGORY_MAP: Record<string, ShopCategoryId> = {
  plaques: 'identification-securite',
  colliers: 'promenade-transport',
  longes: 'promenade-transport',
  jouets: 'jeux-occupation',
  kits: 'kits-securpats',
}

export type ShopAnimalTargetId =
  | 'chien'
  | 'chat'
  | 'chien-chat'
  | 'autres'
  | 'tous'

export type ShopProduct = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  priceCents: number
  category: ShopCategoryId
  /** Animal(s) concerné(s) — indépendant de la catégorie. */
  animalTarget: ShopAnimalTargetId
  /** Quantité en stock (décrémentée à chaque vente). */
  stockQty: number
  imageUrl: string
  imageAlt: string
  highlights: string[]
  sizesEnabled: boolean
  sizes: string[]
  /** Taille colis Mondial Relay (définie en admin, pas au panier). */
  parcelSize: import('./mondial-relay').ParcelSizeId
  active: boolean
  sortOrder: number
}

export const SHOP_CATEGORIES: { id: ShopCategoryId; label: string }[] = [
  { id: 'identification-securite', label: 'Identification & sécurité' },
  { id: 'promenade-transport', label: 'Promenade & transport' },
  { id: 'repas-hydratation', label: 'Repas & hydratation' },
  { id: 'jeux-occupation', label: 'Jeux & occupation' },
  { id: 'confort-accessoires', label: 'Confort & accessoires' },
  { id: 'kits-securpats', label: 'Kits SecurPats' },
  { id: 'produits-numeriques', label: 'Produits numériques' },
]

export const SHOP_ANIMAL_TARGETS: { id: ShopAnimalTargetId; label: string }[] = [
  { id: 'chien', label: 'Chien' },
  { id: 'chat', label: 'Chat' },
  { id: 'chien-chat', label: 'Chien & Chat' },
  { id: 'autres', label: 'Autres animaux' },
  { id: 'tous', label: 'Tous animaux' },
]

export const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/** Prix moyen (compat) — préférer shippingCentsForParcel (Mondial Relay). */
export const SHOP_SHIPPING_CENTS = 490
export const SHOP_FREE_SHIPPING_FROM_CENTS = 4000

export function formatShopPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`
}

export function shippingCentsForSubtotal(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  if (subtotalCents >= SHOP_FREE_SHIPPING_FROM_CENTS) return 0
  return SHOP_SHIPPING_CENTS
}

export function orderTotalCents(subtotalCents: number): number {
  return subtotalCents + shippingCentsForSubtotal(subtotalCents)
}

export function remainingForFreeShippingCents(subtotalCents: number): number {
  if (subtotalCents >= SHOP_FREE_SHIPPING_FROM_CENTS) return 0
  return SHOP_FREE_SHIPPING_FROM_CENTS - subtotalCents
}

export function slugifyProductName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'produit'
}

export function normalizeShopCategoryId(value: string | null | undefined): ShopCategoryId {
  if (!value) return 'kits-securpats'
  if (SHOP_CATEGORIES.some(c => c.id === value)) return value as ShopCategoryId
  return LEGACY_CATEGORY_MAP[value] ?? 'kits-securpats'
}

export function isValidShopAnimalTargetId(value: string | null | undefined): value is ShopAnimalTargetId {
  return !!value && SHOP_ANIMAL_TARGETS.some(a => a.id === value)
}

export function normalizeShopAnimalTargetId(value: string | null | undefined): ShopAnimalTargetId {
  return isValidShopAnimalTargetId(value) ? value : 'tous'
}

export function categoryLabel(id: string): string {
  const normalized = normalizeShopCategoryId(id)
  return SHOP_CATEGORIES.find(c => c.id === normalized)?.label ?? id
}

export function animalTargetLabel(id: string): string {
  const normalized = normalizeShopAnimalTargetId(id)
  return SHOP_ANIMAL_TARGETS.find(a => a.id === normalized)?.label ?? id
}
