import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../server/lib/supabase-admin.js'

const SITE = 'https://www.securpats.fr'

const STATIC_URLS: { loc: string; changefreq: string; priority: string }[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/fonctionnement', changefreq: 'monthly', priority: '0.8' },
  { loc: '/tarifs', changefreq: 'monthly', priority: '0.8' },
  { loc: '/boutique', changefreq: 'weekly', priority: '0.85' },
  { loc: '/actu', changefreq: 'daily', priority: '0.9' },
  { loc: '/faq', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
  { loc: '/inscription', changefreq: 'monthly', priority: '0.9' },
  { loc: '/hospitalisation-animal', changefreq: 'monthly', priority: '0.95' },
  { loc: '/urgence-hospitalisation', changefreq: 'monthly', priority: '0.95' },
  { loc: '/qui-garde-mon-animal', changefreq: 'monthly', priority: '0.95' },
  { loc: '/alerte-animal-urgence', changefreq: 'monthly', priority: '0.9' },
  { loc: '/referents-urgence-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/garde-animal-urgence', changefreq: 'monthly', priority: '0.9' },
  { loc: '/protection-animal-urgence', changefreq: 'monthly', priority: '0.95' },
  { loc: '/accident-animal-urgence', changefreq: 'monthly', priority: '0.9' },
  { loc: '/deces-proprietaire-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/personne-agee-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/violence-conjugale-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/hospitalisation-psychiatrique-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/incarceration-garde-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/voyage-interrompu-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/catastrophe-naturelle-animal', changefreq: 'monthly', priority: '0.9' },
  { loc: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cgu', changefreq: 'yearly', priority: '0.3' },
  { loc: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
  { loc: '/rgpd', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod?: string | null) {
  const last = lastmod ? `<lastmod>${escapeXml(lastmod.slice(0, 10))}</lastmod>` : ''
  return `<url><loc>${escapeXml(`${SITE}${loc}`)}</loc>${last}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method not allowed')
  }

  const parts = STATIC_URLS.map(u => urlEntry(u.loc, u.changefreq, u.priority))

  const supabase = getSupabaseAdmin()
  if (supabase) {
    const { data: posts } = await supabase
      .from('actu_posts')
      .select('slug, published_at, updated_at')
      .eq('published', true)
      .order('published_at', { ascending: false })

    for (const post of posts || []) {
      if (!post.slug) continue
      parts.push(urlEntry(
        `/actu/${post.slug}`,
        'weekly',
        '0.8',
        post.updated_at || post.published_at,
      ))
    }

    const { data: products } = await supabase
      .from('shop_products')
      .select('slug, updated_at')
      .eq('active', true)

    for (const product of products || []) {
      if (!product.slug) continue
      parts.push(urlEntry(`/boutique/${product.slug}`, 'weekly', '0.7', product.updated_at))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${parts.join('\n')}\n</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).send(xml)
}
