/** Catalogue boutique — prix de référence serveur (ne pas faire confiance au client). */
export const SHOP_PRODUCT_PRICES: Record<string, { name: string; priceCents: number }> = {
  'plaque-qr': { name: 'Plaque QR d’urgence', priceCents: 1290 },
  'collier-classique': { name: 'Collier nylon SécurPats', priceCents: 1990 },
  'collier-premium': { name: 'Collier premium cuir', priceCents: 3490 },
  'longe-courte': { name: 'Longe courte 1,5 m', priceCents: 1490 },
  'longe-longue': { name: 'Longe longue 5 m', priceCents: 2290 },
  'jouet-corde': { name: 'Jouet corde mastication', priceCents: 990 },
  'jouet-balle': { name: 'Balle caoutchouc durable', priceCents: 790 },
  'porte-cles-qr': { name: 'Porte-clés QR referents', priceCents: 890 },
  'kit-urgence': { name: 'Kit urgence complet', priceCents: 3990 },
}

export const SHOP_SHIPPING_CENTS = 490
export const SHOP_FREE_SHIPPING_FROM_CENTS = 4000

export function shippingCentsForSubtotal(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  if (subtotalCents >= SHOP_FREE_SHIPPING_FROM_CENTS) return 0
  return SHOP_SHIPPING_CENTS
}
