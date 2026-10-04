import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProductById, loadShopCatalog } from '@/lib/shop/catalog'

export type ShopCartLine = {
  productId: string
  size?: string
  quantity: number
}

const CART_STORAGE_KEY = 'securpats_shop_cart_v2'
const MAX_QUANTITY = 20

type ShopCartContextValue = {
  items: ShopCartLine[]
  itemCount: number
  subtotalCents: number
  catalogReady: boolean
  addItem: (productId: string, options?: { quantity?: number; size?: string }) => string | null
  setQuantity: (productId: string, quantity: number, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  clearCart: () => void
  reloadCatalog: () => Promise<void>
}

const ShopCartContext = createContext<ShopCartContextValue | null>(null)

function lineKey(productId: string, size?: string) {
  return `${productId}::${size || ''}`
}

function normalizeLines(lines: unknown): ShopCartLine[] {
  if (!Array.isArray(lines)) return []
  const result: ShopCartLine[] = []
  for (const line of lines) {
    if (!line || typeof line !== 'object') continue
    const productId = 'productId' in line && typeof line.productId === 'string' ? line.productId : ''
    const size = 'size' in line && typeof line.size === 'string' && line.size ? line.size : undefined
    const quantity = 'quantity' in line ? Number(line.quantity) : 0
    if (!productId) continue
    const qty = Math.min(Math.max(Math.floor(quantity) || 0, 1), MAX_QUANTITY)
    result.push({ productId, size, quantity: qty })
  }
  return result
}

function loadStoredCart(): ShopCartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('securpats_shop_cart_v1')
    if (!raw) return []
    return normalizeLines(JSON.parse(raw))
  } catch {
    return []
  }
}

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShopCartLine[]>(() => loadStoredCart())
  const [catalogReady, setCatalogReady] = useState(false)

  const reloadCatalog = useCallback(async () => {
    await loadShopCatalog()
    setCatalogReady(true)
  }, [])

  useEffect(() => {
    void reloadCatalog()
  }, [reloadCatalog])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((productId: string, options?: { quantity?: number; size?: string }): string | null => {
    const product = getProductById(productId)
    if (!product || !product.active) return 'Produit indisponible'
    if (product.stockQty <= 0) return 'Produit en rupture de stock'
    if (product.sizesEnabled) {
      if (!options?.size || !product.sizes.includes(options.size)) {
        return 'Choisissez une taille'
      }
    }
    const size = product.sizesEnabled ? options?.size : undefined
    const delta = Math.min(Math.max(Math.floor(options?.quantity ?? 1) || 1, 1), MAX_QUANTITY)
    let error: string | null = null
    setItems(prev => {
      const existing = prev.find(line => line.productId === productId && (line.size || '') === (size || ''))
      const alreadyForProduct = prev
        .filter(line => line.productId === productId)
        .reduce((sum, line) => sum + line.quantity, 0)
      const room = Math.max(0, product.stockQty - alreadyForProduct)
      if (room <= 0) {
        error = `Stock insuffisant (disponible : ${product.stockQty})`
        return prev
      }
      const addQty = Math.min(delta, room, MAX_QUANTITY)
      if (!existing) return [...prev, { productId, size, quantity: addQty }]
      return prev.map(line =>
        lineKey(line.productId, line.size) === lineKey(productId, size)
          ? { ...line, quantity: Math.min(line.quantity + addQty, MAX_QUANTITY) }
          : line,
      )
    })
    return error
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number, size?: string) => {
    const product = getProductById(productId)
    const maxStock = product?.stockQty ?? MAX_QUANTITY
    const qty = Math.min(Math.max(Math.floor(quantity) || 0, 0), MAX_QUANTITY, Math.max(0, maxStock))
    setItems(prev => {
      if (qty <= 0) return prev.filter(line => !(line.productId === productId && (line.size || '') === (size || '')))
      const otherForProduct = prev
        .filter(line => line.productId === productId && (line.size || '') !== (size || ''))
        .reduce((sum, line) => sum + line.quantity, 0)
      const capped = Math.min(qty, Math.max(0, maxStock - otherForProduct))
      if (capped <= 0) {
        return prev.filter(line => !(line.productId === productId && (line.size || '') === (size || '')))
      }
      return prev.map(line =>
        line.productId === productId && (line.size || '') === (size || '')
          ? { ...line, quantity: capped }
          : line,
      )
    })
  }, [])

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems(prev => prev.filter(line => !(line.productId === productId && (line.size || '') === (size || ''))))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<ShopCartContextValue>(() => {
    const itemCount = items.reduce((sum, line) => sum + line.quantity, 0)
    const subtotalCents = items.reduce((sum, line) => {
      const product = getProductById(line.productId)
      return sum + (product ? product.priceCents * line.quantity : 0)
    }, 0)

    return {
      items,
      itemCount,
      subtotalCents,
      catalogReady,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      reloadCatalog,
    }
  }, [items, catalogReady, addItem, setQuantity, removeItem, clearCart, reloadCatalog])

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>
}

export function useShopCart(): ShopCartContextValue {
  const ctx = useContext(ShopCartContext)
  if (!ctx) throw new Error('useShopCart must be used within ShopCartProvider')
  return ctx
}
