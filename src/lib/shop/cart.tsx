import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProductById } from '@/lib/shop/catalog'

export type ShopCartLine = {
  productId: string
  quantity: number
}

const CART_STORAGE_KEY = 'securpats_shop_cart_v1'
const MAX_QUANTITY = 20

type ShopCartContextValue = {
  items: ShopCartLine[]
  itemCount: number
  subtotalCents: number
  addItem: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const ShopCartContext = createContext<ShopCartContextValue | null>(null)

function normalizeLines(lines: unknown): ShopCartLine[] {
  if (!Array.isArray(lines)) return []
  return lines
    .map(line => {
      if (!line || typeof line !== 'object') return null
      const productId = 'productId' in line && typeof line.productId === 'string' ? line.productId : ''
      const quantity = 'quantity' in line ? Number(line.quantity) : 0
      if (!productId || !getProductById(productId)) return null
      const qty = Math.min(Math.max(Math.floor(quantity) || 0, 1), MAX_QUANTITY)
      return { productId, quantity: qty }
    })
    .filter((line): line is ShopCartLine => line !== null)
}

function loadStoredCart(): ShopCartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    return normalizeLines(JSON.parse(raw))
  } catch {
    return []
  }
}

function persistCart(items: ShopCartLine[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShopCartLine[]>(() => loadStoredCart())

  useEffect(() => {
    persistCart(items)
  }, [items])

  const addItem = useCallback((productId: string, quantity = 1) => {
    if (!getProductById(productId)) return
    const delta = Math.min(Math.max(Math.floor(quantity) || 1, 1), MAX_QUANTITY)
    setItems(prev => {
      const existing = prev.find(line => line.productId === productId)
      if (!existing) {
        return [...prev, { productId, quantity: delta }]
      }
      return prev.map(line =>
        line.productId === productId
          ? { ...line, quantity: Math.min(line.quantity + delta, MAX_QUANTITY) }
          : line,
      )
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const qty = Math.min(Math.max(Math.floor(quantity) || 0, 0), MAX_QUANTITY)
    setItems(prev => {
      if (qty <= 0) return prev.filter(line => line.productId !== productId)
      return prev.map(line =>
        line.productId === productId ? { ...line, quantity: qty } : line,
      )
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(line => line.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

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
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }
  }, [items, addItem, setQuantity, removeItem, clearCart])

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>
}

export function useShopCart(): ShopCartContextValue {
  const ctx = useContext(ShopCartContext)
  if (!ctx) {
    throw new Error('useShopCart must be used within ShopCartProvider')
  }
  return ctx
}
