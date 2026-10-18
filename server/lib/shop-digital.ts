import { randomBytes } from 'crypto'
import { getSupabaseAdmin } from './supabase-admin.js'
import { sendEmail, escapeHtml } from './emergency-notify.js'

const DIGITAL_BUCKET = 'shop-digital'
const LINK_TTL_DAYS = 7
const SIGNED_URL_TTL_SEC = 60 * 60 // 1 h

export type ShopDigitalDownloadLink = {
  productId: string
  productName: string
  token: string
  pageUrl: string
  expiresAt: string
}

function appBaseUrl(): string {
  return (process.env.VITE_APP_URL || 'https://www.securpats.fr').replace(/\/$/, '')
}

function newToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Après paiement boutique : crée un lien personnel par produit numérique,
 * envoie l’email (une fois), retourne les liens pour la page succès.
 * Idempotent via UNIQUE(stripe_session_id, product_id).
 */
export async function fulfillShopDigitalPurchases(input: {
  stripeSessionId: string
  customerEmail?: string | null
}): Promise<{ downloads: ShopDigitalDownloadLink[]; error?: string }> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { downloads: [], error: 'Supabase admin non configuré' }
  if (!input.stripeSessionId) return { downloads: [], error: 'sessionId manquant' }

  const { data: intent } = await supabase
    .from('shop_checkout_intents')
    .select('items, customer_email')
    .eq('stripe_session_id', input.stripeSessionId)
    .maybeSingle()

  const items = Array.isArray(intent?.items) ? (intent!.items as { id?: string; q?: number }[]) : []
  const productIds = [...new Set(items.map(i => i.id).filter((id): id is string => !!id))]
  if (productIds.length === 0) return { downloads: [] }

  const email =
    (input.customerEmail || intent?.customer_email || '').trim().toLowerCase() || null

  const { data: products, error: prodErr } = await supabase
    .from('shop_products')
    .select('id, name, category, digital_file_path')
    .in('id', productIds)

  if (prodErr) return { downloads: [], error: prodErr.message }

  const digitalProducts = ((products ?? []) as {
    id: string
    name: string
    category?: string | null
    digital_file_path?: string | null
  }[]).filter(
    p => p.category === 'produits-numeriques' && (p.digital_file_path || '').trim().length > 0,
  )

  if (digitalProducts.length === 0) return { downloads: [] }

  const expiresAt = new Date(Date.now() + LINK_TTL_DAYS * 86400000).toISOString()
  const downloads: ShopDigitalDownloadLink[] = []

  for (const product of digitalProducts) {
    const filePath = product.digital_file_path!.trim()

    const { data: existing } = await supabase
      .from('shop_digital_downloads')
      .select('token, product_name, expires_at, email_sent')
      .eq('stripe_session_id', input.stripeSessionId)
      .eq('product_id', product.id)
      .maybeSingle()

    let token: string
    let emailSent = false

    if (existing?.token) {
      token = existing.token
      emailSent = !!existing.email_sent
    } else {
      token = newToken()
      const { error: insertErr } = await supabase.from('shop_digital_downloads').insert({
        token,
        stripe_session_id: input.stripeSessionId,
        product_id: product.id,
        product_name: product.name,
        customer_email: email,
        file_path: filePath,
        expires_at: expiresAt,
        download_count: 0,
        max_downloads: 10,
        email_sent: false,
      })
      if (insertErr) {
        // Course possible avec le webhook : relire
        const { data: again } = await supabase
          .from('shop_digital_downloads')
          .select('token, email_sent')
          .eq('stripe_session_id', input.stripeSessionId)
          .eq('product_id', product.id)
          .maybeSingle()
        if (!again?.token) {
          console.error('[shop digital] insert failed', product.id, insertErr.message)
          continue
        }
        token = again.token
        emailSent = !!again.email_sent
      }
    }

    const pageUrl = `${appBaseUrl()}/boutique/telecharger/${token}`
    downloads.push({
      productId: product.id,
      productName: product.name,
      token,
      pageUrl,
      expiresAt: existing?.expires_at || expiresAt,
    })

    if (email && !emailSent) {
      const html = `
        <p>Bonjour,</p>
        <p>Merci pour votre achat sur <strong>SécurPats</strong>.</p>
        <p>Votre produit numérique <strong>${escapeHtml(product.name)}</strong> est prêt.</p>
        <p>
          <a href="${pageUrl}" style="display:inline-block;padding:12px 20px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Télécharger mon fichier
          </a>
        </p>
        <p style="color:#64748b;font-size:14px">
          Ce lien personnel est valable ${LINK_TTL_DAYS} jours et limité à 10 téléchargements.
          Ne le partagez pas : il est lié à votre commande.
        </p>
        <p style="color:#64748b;font-size:13px">Si le bouton ne fonctionne pas : ${escapeHtml(pageUrl)}</p>
        <p>L’équipe SécurPats</p>
      `
      const result = await sendEmail(email, `Votre ebook SécurPats — ${product.name}`, html)
      if (result.sent) {
        await supabase
          .from('shop_digital_downloads')
          .update({ email_sent: true })
          .eq('token', token)
      } else {
        console.error('[shop digital] email failed', email, result.error)
      }
    }
  }

  return { downloads }
}

/** Liste les liens pour une session (page succès). */
export async function listDigitalDownloadsForSession(stripeSessionId: string): Promise<{
  downloads: ShopDigitalDownloadLink[]
  error?: string
}> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { downloads: [], error: 'Supabase admin non configuré' }

  const { data, error } = await supabase
    .from('shop_digital_downloads')
    .select('token, product_id, product_name, expires_at')
    .eq('stripe_session_id', stripeSessionId)

  if (error) return { downloads: [], error: error.message }

  const base = appBaseUrl()
  return {
    downloads: ((data ?? []) as {
      token: string
      product_id: string
      product_name: string
      expires_at: string
    }[]).map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      token: row.token,
      pageUrl: `${base}/boutique/telecharger/${row.token}`,
      expiresAt: row.expires_at,
    })),
  }
}

/** Valide le token et renvoie une URL signée temporaire (1 h). */
export async function createDigitalSignedDownloadUrl(token: string): Promise<{
  url: string | null
  fileName: string | null
  productName: string | null
  error: string | null
}> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { url: null, fileName: null, productName: null, error: 'Supabase admin non configuré' }
  if (!token?.trim()) return { url: null, fileName: null, productName: null, error: 'Lien invalide' }

  const { data: row, error } = await supabase
    .from('shop_digital_downloads')
    .select('token, file_path, product_name, expires_at, download_count, max_downloads')
    .eq('token', token.trim())
    .maybeSingle()

  if (error) return { url: null, fileName: null, productName: null, error: error.message }
  if (!row) return { url: null, fileName: null, productName: null, error: 'Lien introuvable ou expiré' }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { url: null, fileName: null, productName: row.product_name, error: 'Ce lien a expiré' }
  }
  if ((row.download_count ?? 0) >= (row.max_downloads ?? 10)) {
    return {
      url: null,
      fileName: null,
      productName: row.product_name,
      error: 'Nombre maximal de téléchargements atteint',
    }
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(DIGITAL_BUCKET)
    .createSignedUrl(row.file_path, SIGNED_URL_TTL_SEC, {
      download: row.file_path.split('/').pop() || 'ebook.pdf',
    })

  if (signErr || !signed?.signedUrl) {
    return {
      url: null,
      fileName: null,
      productName: row.product_name,
      error: signErr?.message || 'Impossible de générer le fichier',
    }
  }

  await supabase
    .from('shop_digital_downloads')
    .update({ download_count: (row.download_count ?? 0) + 1 })
    .eq('token', token.trim())

  return {
    url: signed.signedUrl,
    fileName: row.file_path.split('/').pop() || 'ebook.pdf',
    productName: row.product_name,
    error: null,
  }
}

export async function getDigitalDownloadMeta(token: string): Promise<{
  productName: string | null
  expiresAt: string | null
  downloadsLeft: number | null
  error: string | null
}> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { productName: null, expiresAt: null, downloadsLeft: null, error: 'Config manquante' }

  const { data: row, error } = await supabase
    .from('shop_digital_downloads')
    .select('product_name, expires_at, download_count, max_downloads')
    .eq('token', token.trim())
    .maybeSingle()

  if (error || !row) {
    return { productName: null, expiresAt: null, downloadsLeft: null, error: 'Lien introuvable' }
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return {
      productName: row.product_name,
      expiresAt: row.expires_at,
      downloadsLeft: 0,
      error: 'Ce lien a expiré',
    }
  }
  const left = Math.max(0, (row.max_downloads ?? 10) - (row.download_count ?? 0))
  return {
    productName: row.product_name,
    expiresAt: row.expires_at,
    downloadsLeft: left,
    error: left <= 0 ? 'Nombre maximal de téléchargements atteint' : null,
  }
}
