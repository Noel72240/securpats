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
}

export const SHOP_CATEGORIES: { id: ShopCategoryId; label: string }[] = [
  { id: 'plaques', label: 'Plaques QR' },
  { id: 'colliers', label: 'Colliers' },
  { id: 'longes', label: 'Longes' },
  { id: 'jouets', label: 'Jouets' },
  { id: 'kits', label: 'Kits' },
]

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'plaque-qr',
    slug: 'plaque-qr',
    name: 'Plaque QR d’urgence',
    shortDescription: 'Plaque métal gravée, scan instantané vers la fiche secours.',
    description:
      'Plaque en aluminium anodisé avec QR code SécurPats gravé au laser. Fixation sur collier ou harnais. Résistante à l’eau et aux chocs, idéale pour identifier votre animal en urgence.',
    priceCents: 1290,
    category: 'plaques',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
    imageAlt: 'Plaque d’identification pour chien',
    highlights: ['Gravure laser durable', 'Compatible collier & harnais', 'Lien vers fiche secours'],
  },
  {
    id: 'collier-classique',
    slug: 'collier-classique',
    name: 'Collier nylon SécurPats',
    shortDescription: 'Collier réglable résistant, boucle sécurisée.',
    description:
      'Collier en nylon renforcé avec boucle métal et anneau pour médaille QR. Réglable S à L, confortable au quotidien pour chiens et chats actifs.',
    priceCents: 1990,
    category: 'colliers',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    imageAlt: 'Collier pour chien en nylon',
    highlights: ['Nylon renforcé', 'Boucle sécurisée', 'Anneau pour plaque QR'],
  },
  {
    id: 'collier-premium',
    slug: 'collier-premium',
    name: 'Collier premium cuir',
    shortDescription: 'Cuir véritable, finitions soignées, élégant et solide.',
    description:
      'Collier en cuir pleine fleur avec coutures renforcées et boucle laiton. Design sobre pour propriétaires exigeants, parfait avec la plaque QR SécurPats.',
    priceCents: 3490,
    category: 'colliers',
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
    imageAlt: 'Collier cuir pour chien',
    highlights: ['Cuir pleine fleur', 'Boucle laiton', 'Finitions premium'],
  },
  {
    id: 'longe-courte',
    slug: 'longe-courte',
    name: 'Longe courte 1,5 m',
    shortDescription: 'Longe urbaine pour promenades maîtrisées.',
    description:
      'Longe de 1,5 m en nylon tressé avec poignée confort et mousqueton rotatif. Idéale en ville et pour les chiens réactifs.',
    priceCents: 1490,
    category: 'longes',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
    imageAlt: 'Longe courte pour chien',
    highlights: ['1,5 m — usage urbain', 'Mousqueton rotatif', 'Poignée rembourrée'],
  },
  {
    id: 'longe-longue',
    slug: 'longe-longue',
    name: 'Longe longue 5 m',
    shortDescription: 'Plus de liberté en parc ou jardin clos.',
    description:
      'Longe de 5 m légère et résistante, parfaite pour l’éducation, les parcs ou les propriétés. Mousqueton robuste et poignée antidérapante.',
    priceCents: 2290,
    category: 'longes',
    imageUrl: 'https://images.unsplash.com/photo-1547148414-2ccf3a710b7b?w=800&q=80',
    imageAlt: 'Longe longue pour chien au parc',
    highlights: ['5 m de longueur', 'Légère & résistante', 'Idéale éducation'],
  },
  {
    id: 'jouet-corde',
    slug: 'jouet-corde',
    name: 'Jouet corde mastication',
    shortDescription: 'Corde tressée pour mâcher et jouer.',
    description:
      'Jouet en corde coton tressée, favorise le jeu interactif et l’hygiène dentaire. Taille adaptée aux chiens moyens et grands.',
    priceCents: 990,
    category: 'jouets',
    imageUrl: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800&q=80',
    imageAlt: 'Jouet corde pour chien',
    highlights: ['Coton tressé', 'Jeu interactif', 'Entretien facile'],
  },
  {
    id: 'jouet-balle',
    slug: 'jouet-balle',
    name: 'Balle caoutchouc durable',
    shortDescription: 'Balle rebondissante, résistante aux morsures.',
    description:
      'Balle en caoutchouc naturel non toxique, rebond stable et texture préhensible. Parfaite pour l’énergie débordante de votre compagnon.',
    priceCents: 790,
    category: 'jouets',
    imageUrl: 'https://images.unsplash.com/photo-1604079620690-4bccb3470cce?w=800&q=80',
    imageAlt: 'Balle jouet pour chien',
    highlights: ['Caoutchouc naturel', 'Rebond stable', 'Résistante'],
  },
  {
    id: 'porte-cles-qr',
    slug: 'porte-cles-qr',
    name: 'Porte-clés QR référents',
    shortDescription: 'QR compact pour les référents d’urgence.',
    description:
      'Porte-clés discret avec QR code vers les contacts d’urgence de votre animal. À offrir aux référents ou garder sur vos clés.',
    priceCents: 890,
    category: 'plaques',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
    imageAlt: 'Porte-clés avec médaille',
    highlights: ['Format compact', 'QR référents', 'Cadeau utile'],
  },
  {
    id: 'kit-urgence',
    slug: 'kit-urgence',
    name: 'Kit urgence complet',
    shortDescription: 'Plaque QR + collier + porte-clés, prêt à l’emploi.',
    description:
      'Pack complet SécurPats : plaque QR gravée, collier nylon réglable et porte-clés référents. La solution tout-en-un pour sécuriser votre animal rapidement.',
    priceCents: 3990,
    category: 'kits',
    imageUrl: 'https://images.unsplash.com/photo-1450778864180-1af5ae229c9e?w=800&q=80',
    imageAlt: 'Chien avec accessoires de sécurité',
    highlights: ['Plaque + collier + porte-clés', 'Économie sur le pack', 'Prêt en 2 minutes'],
  },
]

export const SHOP_SHIPPING_CENTS = 490
export const SHOP_FREE_SHIPPING_FROM_CENTS = 4000

export function formatShopPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`
}

export function getProductBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find(p => p.slug === slug)
}

export function getProductById(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find(p => p.id === id)
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
