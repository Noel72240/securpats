import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ShopAnimalTargetId, ShopCategoryId, ShopProduct } from './types'
import {
  normalizeShopAnimalTargetId,
  normalizeShopCategoryId,
} from './types'
import { isValidParcelSizeId, type ParcelSizeId } from './mondial-relay'

type ShopRow = {
  id: string
  slug: string
  name: string
  short_description: string
  description: string
  price_cents: number
  category: string
  animal_target?: string | null
  image_url: string
  image_alt: string
  highlights: string[] | null
  sizes_enabled: boolean
  sizes: string[] | null
  parcel_size?: string | null
  active: boolean
  sort_order: number
}

function parcelFromRow(value: string | null | undefined): ParcelSizeId {
  return isValidParcelSizeId(value) ? value : 'petit'
}

export function shopProductFromRow(row: ShopRow): ShopProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    category: normalizeShopCategoryId(row.category),
    animalTarget: normalizeShopAnimalTargetId(row.animal_target),
    imageUrl: row.image_url,
    imageAlt: row.image_alt || row.name,
    highlights: row.highlights ?? [],
    sizesEnabled: row.sizes_enabled,
    sizes: row.sizes ?? [],
    parcelSize: parcelFromRow(row.parcel_size),
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
    category: normalizeShopCategoryId(product.category as ShopCategoryId | string | undefined),
    animal_target: normalizeShopAnimalTargetId(product.animalTarget as ShopAnimalTargetId | string | undefined),
    image_url: product.imageUrl ?? '',
    image_alt: product.imageAlt ?? product.name,
    highlights: product.highlights ?? [],
    sizes_enabled: product.sizesEnabled ?? false,
    sizes: product.sizesEnabled ? (product.sizes ?? []) : [],
    parcel_size: isValidParcelSizeId(product.parcelSize) ? product.parcelSize : 'petit',
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
