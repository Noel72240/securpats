export type { ShopCategoryId, ShopProduct } from './types'
export {
  SHOP_CATEGORIES,
  DEFAULT_SIZE_OPTIONS,
  SHOP_SHIPPING_CENTS,
  SHOP_FREE_SHIPPING_FROM_CENTS,
  formatShopPrice,
  shippingCentsForSubtotal,
  orderTotalCents,
  remainingForFreeShippingCents,
  slugifyProductName,
  categoryLabel,
} from './types'

import type { ShopProduct } from './types'
import { fetchShopProducts } from './api'

/** Cache mémoire pour le panier / pages boutique. */
let productsCache: ShopProduct[] = []

export function setShopProductsCache(products: ShopProduct[]) {
  productsCache = products
}

export function getShopProductsCache(): ShopProduct[] {
  return productsCache
}

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return productsCache.find(p => p.slug === slug)
}

export function getProductById(id: string): ShopProduct | undefined {
  return productsCache.find(p => p.id === id)
}

export async function loadShopCatalog(): Promise<{ products: ShopProduct[]; error: string | null }> {
  const result = await fetchShopProducts()
  if (!result.error) setShopProductsCache(result.products)
  return result
}
