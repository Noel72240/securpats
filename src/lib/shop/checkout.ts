import type { ShopCartLine } from '@/lib/shop/cart'

export async function createShopCheckout(options: {
  items: ShopCartLine[]
  customerEmail?: string
}): Promise<{ error?: string }> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'shop',
        items: options.items,
        customerEmail: options.customerEmail?.trim() || '',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Erreur lors de la création de la session de paiement' }
    }

    if (data.url) {
      window.location.href = data.url
      return {}
    }

    return { error: 'Réponse Stripe invalide' }
  } catch {
    return { error: 'Impossible de contacter le serveur de paiement. Vérifiez que les routes API sont déployées.' }
  }
}
