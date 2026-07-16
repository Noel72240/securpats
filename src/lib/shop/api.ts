import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ShopCategoryId, ShopProduct } from './types'

type ShopRow = {
  id: string
  slug: string
  name: string
  short_description: string
  description: string
  price_cents: number
  category: string
  image_url: string
  image_alt: string
  highlights: string[] | null
  sizes_enabled: boolean
  sizes: string[] | null
  active: boolean
  sort_order: number
}

export function shopProductFromRow(row: ShopRow): ShopProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    category: row.category as ShopCategoryId,
    imageUrl: row.image_url,
    imageAlt: row.image_alt || row.name,
    highlights: row.highlights ?? [],
    sizesEnabled: row.sizes_enabled,
    sizes: row.sizes ?? [],
    active: row.active,
    sortOrder: row.sort_order,
  }
}

export function shopProductToRow(product: Partial<ShopProduct> & { id: string; slug: string; name: string; priceCents: number }) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_description: product.shortDescription ?? '',
    description: product.description ?? '',
    price_cents: product.priceCents,
    category: product.category ?? 'kits',
    image_url: product.imageUrl ?? '',
    image_alt: product.imageAlt ?? product.name,
    highlights: product.highlights ?? [],
    sizes_enabled: product.sizesEnabled ?? false,
    sizes: product.sizesEnabled ? (product.sizes ?? []) : [],
    active: product.active ?? true,
    sort_order: product.sortOrder ?? 100,
    updated_at: new Date().toISOString(),
  }
}

/** Produits visibles boutique (actifs uniquement). */
export async function fetchShopProducts(): Promise<{ products: ShopProduct[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { products: [], error: 'Supabase non configuré' }
  }
  const { data, error } = await getSupabase()
    .from('shop_products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) return { products: [], error: error.message }
  return { products: (data as ShopRow[]).map(shopProductFromRow), error: null }
}

/** Tous les produits (admin). */
export async function fetchAllShopProductsAdmin(): Promise<{ products: ShopProduct[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { products: [], error: 'Supabase non configuré' }
  }
  const { data, error } = await getSupabase()
    .from('shop_products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) return { products: [], error: error.message }
  return { products: (data as ShopRow[]).map(shopProductFromRow), error: null }
}

export async function upsertShopProduct(product: ShopProduct): Promise<{ product: ShopProduct | null; error: string | null }> {
  const row = shopProductToRow(product)
  const { data, error } = await getSupabase()
    .from('shop_products')
    .upsert(row)
    .select()
    .single()
  if (error) return { product: null, error: error.message }
  return { product: shopProductFromRow(data as ShopRow), error: null }
}

export async function deleteShopProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await getSupabase().from('shop_products').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function setShopProductActive(id: string, active: boolean): Promise<{ error: string | null }> {
  const { error } = await getSupabase()
    .from('shop_products')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  return { error: error?.message ?? null }
}
