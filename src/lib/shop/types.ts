export type ShopCategoryId =
  | 'identification-securite'
  | 'colliers'
  | 'longes'
  | 'promenade-transport'
  | 'repas-hydratation'
  | 'jeux-occupation'
  | 'confort-accessoires'
  | 'kits-securpats'
  | 'produits-numeriques'

/** Anciennes / alias → id canonique. */
const LEGACY_CATEGORY_MAP: Record<string, ShopCategoryId> = {
  plaques: 'identification-securite',
  jouets: 'jeux-occupation',
  kits: 'kits-securpats',
  longe: 'longes',
  collier: 'colliers',
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
  /** Chemin fichier privé (bucket shop-digital) pour ebooks / PDF. */
  digitalFilePath: string
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

/** Catégories affichées boutique + admin (filtre = catégorie produit). */
export const SHOP_CATEGORIES: { id: ShopCategoryId; label: string }[] = [
  { id: 'identification-securite', label: 'Identification & sécurité' },
  { id: 'colliers', label: 'Colliers' },
  { id: 'longes', label: 'Longes' },
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

/** Produit visible pour un filtre animal ( « tous animaux » apparaît partout ). */
export function shopProductMatchesAnimalFilter(
  productAnimal: string | null | undefined,
  filter: ShopAnimalTargetId | 'all',
): boolean {
  if (filter === 'all') return true
  const target = normalizeShopAnimalTargetId(productAnimal)
  if (target === 'tous') return true
  return target === filter
}

/** Produits numériques : pas de stock (quantité illimitée). */
export function isDigitalShopCategory(category: string | null | undefined): boolean {
  return normalizeShopCategoryId(category) === 'produits-numeriques'
}

export function shopProductTracksStock(category: string | null | undefined): boolean {
  return !isDigitalShopCategory(category)
}

/** Produits physiques uniquement : colis Mondial Relay + livraison. */
export function shopProductRequiresShipping(category: string | null | undefined): boolean {
  return !isDigitalShopCategory(category)
}

/** Valeur stock stockée en base pour les produits numériques (jamais affichée). */
export const DIGITAL_PRODUCT_STOCK_QTY = 999999
