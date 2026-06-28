const STRIPE_API = 'https://api.stripe.com/v1'
const STRIPE_VERSION = '2023-10-16'

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim().replace(/^["']|["']$/g, '').replace(/^["']|["']$/g, '')
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurée')
  return key
}

type StripeErrorBody = { error?: { message?: string; type?: string } }

async function parseStripeResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & StripeErrorBody
  if (!res.ok) {
    const msg = data.error?.message || `Erreur Stripe (HTTP ${res.status})`
    throw new Error(msg)
  }
  return data
}

export async function stripePostForm<T>(path: string, fields: Record<string, string>): Promise<T> {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== '') body.append(key, value)
  }

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': STRIPE_VERSION,
    },
    body: body.toString(),
  })

  return parseStripeResponse<T>(res)
}

export async function stripeGet<T>(path: string, query?: Record<string, string>): Promise<T> {
  const url = new URL(`${STRIPE_API}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Stripe-Version': STRIPE_VERSION,
    },
  })

  return parseStripeResponse<T>(res)
}
