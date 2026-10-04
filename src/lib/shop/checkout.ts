import type { ShopCartLine } from '@/lib/shop/cart'
import type { ParcelSizeId, RelayPoint } from '@/lib/shop/mondial-relay'
import { apiUrl } from '@/lib/platform'

export async function createShopCheckout(options: {
  items: ShopCartLine[]
  customerEmail?: string
  relayPoint?: RelayPoint | null
}): Promise<{ error?: string }> {
  try {
    const response = await fetch(apiUrl('/api/stripe/create-checkout-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'shop',
        items: options.items,
        customerEmail: options.customerEmail?.trim() || '',
        relayPoint: options.relayPoint ?? undefined,
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

export async function searchShopRelayPoints(options: {
  postalCode: string
  parcelSize: ParcelSizeId
  country?: string
}): Promise<
  | { ok: true; configured: boolean; points: RelayPoint[]; message?: string }
  | { ok: false; error: string }
> {
  try {
    const response = await fetch(apiUrl('/api/stripe/create-checkout-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'relay-points',
        postalCode: options.postalCode,
        parcelSize: options.parcelSize,
        country: options.country || 'FR',
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      return { ok: false, error: data.error || 'Recherche Point Relais impossible' }
    }
    return {
      ok: true,
      configured: Boolean(data.configured),
      points: Array.isArray(data.points) ? data.points : [],
      message: typeof data.message === 'string' ? data.message : undefined,
    }
  } catch {
    return { ok: false, error: 'Impossible de contacter le serveur Mondial Relay' }
  }
}
