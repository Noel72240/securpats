export type ShopCategoryId = 'plaques' | 'colliers' | 'longes' | 'jouets' | 'kits'

export type ShopProduct = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  priceCents: number
  category: ShopCategoryId
  imageUrl: string
  imageAlt: string
  highlights: string[]
  sizesEnabled: boolean
  sizes: string[]
  active: boolean
  sortOrder: number
}

export const SHOP_CATEGORIES: { id: ShopCategoryId; label: string }[] = [
  { id: 'plaques', label: 'Plaques QR' },
  { id: 'colliers', label: 'Colliers' },
  { id: 'longes', label: 'Longes' },
  { id: 'jouets', label: 'Jouets' },
  { id: 'kits', label: 'Kits' },
]

export const DEFAULT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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

export function categoryLabel(id: string): string {
  return SHOP_CATEGORIES.find(c => c.id === id)?.label ?? id
}
