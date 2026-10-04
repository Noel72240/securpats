import { getSupabaseAdmin } from './supabase-admin.js'
import {
  SHOP_FREE_SHIPPING_FROM_CENTS,
  SHOP_SHIPPING_CENTS,
  shippingCentsForParcel,
} from './shop-catalog.js'
import { isValidParcelSizeId, maxParcelSize, type ParcelSizeId } from './mondial-relay.js'

export type ShopPriceRow = {
  id: string
  name: string
  price_cents: number
  active: boolean
  sizes_enabled: boolean
  sizes: string[] | null
  parcel_size?: string | null
  stock_qty?: number | null
}

export type ResolvedShopLine = {
  productId: string
  name: string
  priceCents: number
  quantity: number
  size?: string
  parcelSize: ParcelSizeId
}

export function shippingCentsForSubtotal(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  if (subtotalCents >= SHOP_FREE_SHIPPING_FROM_CENTS) return 0
  return SHOP_SHIPPING_CENTS
}

export { shippingCentsForParcel, maxParcelSize }

/** Prix + taille colis depuis la base (source de vérité). Le client ne choisit pas la taille. */
export async function resolveShopLinePrices(
  items: { productId: string; quantity: number; size?: string }[],
): Promise<
  | { ok: true; lines: ResolvedShopLine[]; parcelSize: ParcelSizeId }
  | { ok: false; error: string }
> {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return { ok: false, error: 'Base boutique non configurée' }
  }

  const ids = [...new Set(items.map(i => i.productId).filter(Boolean))]
  if (ids.length === 0) return { ok: false, error: 'Panier vide' }

  const { data, error } = await supabase
    .from('shop_products')
    .select('id, name, price_cents, active, sizes_enabled, sizes, parcel_size, stock_qty')
    .in('id', ids)

  if (error) {
    // Colonnes absentes (migrations) → retry sans stock / parcel
    const retry = await supabase
      .from('shop_products')
      .select('id, name, price_cents, active, sizes_enabled, sizes')
      .in('id', ids)

    if (retry.error) {
      const { SHOP_PRODUCT_PRICES } = await import('./shop-catalog.js')
      const lines: ResolvedShopLine[] = []
      for (const item of items) {
        const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
        if (!qty) continue
        const p = SHOP_PRODUCT_PRICES[item.productId]
        if (!p) return { ok: false, error: `Produit inconnu : ${item.productId}` }
        lines.push({
          productId: item.productId,
          name: item.size ? `${p.name} — Taille ${item.size}` : p.name,
          priceCents: p.priceCents,
          quantity: qty,
          size: item.size,
          parcelSize: 'petit',
        })
      }
      if (lines.length === 0) return { ok: false, error: 'Aucun article valide' }
      return { ok: true, lines, parcelSize: maxParcelSize(lines.map(l => l.parcelSize)) }
    }

    const byId = new Map((retry.data as ShopPriceRow[]).map(r => [r.id, r]))
    const lines: ResolvedShopLine[] = []
    for (const item of items) {
      const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
      if (!qty || !item.productId) continue
      const product = byId.get(item.productId)
      if (!product || !product.active) {
        return { ok: false, error: `Produit indisponible : ${item.productId}` }
      }
      if (product.sizes_enabled) {
        const allowed = product.sizes ?? []
        if (!item.size || !allowed.includes(item.size)) {
          return { ok: false, error: `Taille requise pour ${product.name}` }
        }
      }
      lines.push({
        productId: product.id,
        name: item.size && product.sizes_enabled ? `${product.name} — Taille ${item.size}` : product.name,
        priceCents: product.price_cents,
        quantity: qty,
        size: item.size,
        parcelSize: 'petit',
      })
    }
    if (lines.length === 0) return { ok: false, error: 'Aucun article valide' }
    return { ok: true, lines, parcelSize: maxParcelSize(lines.map(l => l.parcelSize)) }
  }

  const byId = new Map((data as ShopPriceRow[]).map(r => [r.id, r]))
  const lines: ResolvedShopLine[] = []
  // Somme des quantités demandées par produit (toutes tailles)
  const requestedByProduct = new Map<string, number>()

  for (const item of items) {
    const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
    if (!qty || !item.productId) continue
    requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + qty)
  }

  for (const item of items) {
    const qty = Math.min(Math.max(Number(item.quantity) || 0, 0), 20)
    if (!qty || !item.productId) continue
    const product = byId.get(item.productId)
    if (!product || !product.active) {
      return { ok: false, error: `Produit indisponible : ${item.productId}` }
    }
    if (product.sizes_enabled) {
      const allowed = product.sizes ?? []
      if (!item.size || !allowed.includes(item.size)) {
        return { ok: false, error: `Taille requise pour ${product.name}` }
      }
    }
    const stock = typeof product.stock_qty === 'number' ? product.stock_qty : null
    if (stock !== null) {
      const needed = requestedByProduct.get(product.id) || qty
      if (stock <= 0) {
        return { ok: false, error: `Rupture de stock : ${product.name}` }
      }
      if (needed > stock) {
        return {
          ok: false,
          error: `Stock insuffisant pour « ${product.name} » (disponible : ${stock})`,
        }
      }
    }
    const parcelSize: ParcelSizeId = isValidParcelSizeId(product.parcel_size) ? product.parcel_size : 'petit'
    lines.push({
      productId: product.id,
      name: item.size && product.sizes_enabled ? `${product.name} — Taille ${item.size}` : product.name,
      priceCents: product.price_cents,
      quantity: qty,
      size: item.size,
      parcelSize,
    })
  }

  if (lines.length === 0) return { ok: false, error: 'Aucun article valide' }
  return { ok: true, lines, parcelSize: maxParcelSize(lines.map(l => l.parcelSize)) }
}
