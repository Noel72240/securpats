/**
 * Génère un HTML unique par URL publique (titre, description, canonical, JSON-LD)
 * pour que Google indexe correctement ce SPA Vite.
 * Exécuté après `vite build`. Vercel sert ces fichiers avant le rewrite SPA.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const SITE = 'https://www.securpats.fr'
const OG = `${SITE}/og-image.jpg`

const STATIC_META = [
  {
    path: '/',
    title: "SécurPats — Protection animale d'urgence | securpats.fr (pas Sécur’Pass banque)",
    description:
      "SécurPats (securpats) : plateforme française de protection animale d'urgence. Alertes, QR code secours, chiens & chats. Site officiel securpats.fr — distinct de Sécur’Pass bancaire.",
    keywords: ['SécurPats', 'securpats', 'SecurPats', 'protection animale urgence', 'hospitalisation animal', 'aide animalière'],
  },
  {
    path: '/fonctionnement',
    title: 'Comment fonctionne SécurPats — étapes de protection animale',
    description:
      'Découvrez le parcours SécurPats : compte, fiches animaux, référents, QR Code et alerte urgence. Protection claire en cas d’hospitalisation.',
    keywords: ['fonctionnement SécurPats', 'QR code animal urgence', 'comment protéger son animal'],
  },
  {
    path: '/tarifs',
    title: 'Tarifs SécurPats — abonnement protection animale dès 4,99 €',
    description:
      'Abonnements SécurPats : 4,99 €/mois ou 49,99 €/an pour les propriétaires. Pet-Sitter VIP 9,90 €/mois. Paiement Stripe sécurisé.',
    keywords: ['tarif SécurPats', 'abonnement protection animal', 'prix garde urgence animal'],
  },
  {
    path: '/faq',
    title: 'FAQ SécurPats — bien-être animal, urgence et abonnement',
    description:
      'Questions fréquentes SécurPats : bien-être animal, hospitalisation, QR Code, référents, sécurité des données et abonnement.',
    keywords: ['FAQ SécurPats', 'bien-être animal', 'abonnement SécurPats', 'aide animalière FAQ'],
  },
  {
    path: '/contact',
    title: 'Contact SécurPats — assistance protection animale',
    description:
      'Contactez l’équipe SécurPats pour toute question sur la protection de vos animaux, l’abonnement ou le support technique.',
    keywords: ['contact SécurPats', 'aide SécurPats', 'support protection animal'],
  },
  {
    path: '/boutique',
    title: 'Boutique SécurPats — accessoires et ebooks animaux',
    description:
      'Boutique SécurPats : longes, colliers, accessoires voyage et ebooks pour anticiper les urgences animales.',
    keywords: ['boutique SécurPats', 'longe chien', 'accessoires animaux'],
  },
  {
    path: '/actu',
    title: 'Actu SécurPats — actualités protection animale',
    description:
      'Actualités SécurPats sur la protection animale, les abandons, les urgences et les bons gestes pour vos compagnons.',
    keywords: ['actu protection animale', 'actualité animaux France', 'SécurPats news'],
  },
  {
    path: '/inscription',
    title: 'Inscription SécurPats — protégez vos animaux dès aujourd’hui',
    description:
      'Créez votre compte SécurPats en quelques minutes : fiches animaux, référents d’urgence et QR Code de secours.',
    keywords: ['inscription SécurPats', 'créer compte protection animal'],
  },
]

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function injectMeta(html, { path, title, description, keywords }) {
  const url = `${SITE}${path === '/' ? '/' : path}`
  const kw = (keywords || []).join(', ')
  let out = html

  // Retire anciens meta SEO pour éviter les doublons
  out = out.replace(/<meta\s+(?:property|name)="(?:og|twitter):[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '')
  out = out.replace(/<script[^>]*id="securpats-prerender-schema"[^>]*>[\s\S]*?<\/script>\s*/gi, '')
  out = out.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')

  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  if (/<meta\s+name="keywords"/i.test(out)) {
    out = out.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(kw)}" />`,
    )
  } else {
    out = out.replace(
      '</title>',
      `</title>\n    <meta name="keywords" content="${escapeHtml(kw)}" />`,
    )
  }
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
  )
  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="fr"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="alternate" hreflang="fr" href="${escapeHtml(url)}" />`,
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'SécurPats',
        alternateName: ['SecurPats', 'Securpats', 'securpats'],
        description:
          "Site officiel SécurPats — protection animale d'urgence (pas le Sécur'Pass bancaire).",
        inLanguage: 'fr-FR',
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'SécurPats',
        alternateName: ['SecurPats', 'Securpats', 'securpats'],
        url: SITE,
        logo: OG,
        email: 'contact@securpats.fr',
        description:
          "Plateforme française de protection animale d'urgence et d'aide animalière.",
        disambiguatingDescription:
          "SécurPats (securpats.fr) protège les animaux. Ce n'est pas Sécur'Pass / SecurPass bancaire.",
        areaServed: 'FR',
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: { '@id': `${SITE}/#website` },
        inLanguage: 'fr-FR',
      },
    ],
  }

  const block = `
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SécurPats" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:image" content="${OG}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${OG}" />
    <script type="application/ld+json" id="securpats-prerender-schema">${JSON.stringify(jsonLd)}</script>
`

  out = out.replace('</head>', `${block}\n  </head>`)
  return out
}

async function main() {
  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) {
    console.error('[prerender-seo] dist/index.html introuvable — lancez vite build avant.')
    process.exit(1)
  }
  const baseHtml = readFileSync(indexPath, 'utf8')

  /** Parse path/title/meta depuis les fichiers TS SEO (sans bundler). */
  function parseSeoTs(filePath) {
    const src = readFileSync(filePath, 'utf8')
    const pages = []
    const blockRe =
      /\{\s*path:\s*'([^']+)'[\s\S]*?title:\s*'((?:\\'|[^'])*)'[\s\S]*?metaDescription:\s*'((?:\\'|[^'])*)'[\s\S]*?keywords:\s*\[([\s\S]*?)\]/g
    let m
    while ((m = blockRe.exec(src))) {
      const keywords = [...m[4].matchAll(/'((?:\\'|[^'])*)'/g)].map(x => x[1].replace(/\\'/g, "'"))
      pages.push({
        path: m[1],
        title: m[2].replace(/\\'/g, "'"),
        description: m[3].replace(/\\'/g, "'"),
        keywords,
      })
    }
    return pages
  }

  let seoPages = []
  try {
    seoPages = [
      ...parseSeoTs(join(root, 'src/lib/seo/content.ts')),
      ...parseSeoTs(join(root, 'src/lib/seo/scenario-pages.ts')),
    ]
  } catch (err) {
    console.warn('[prerender-seo] parse SEO échoué, static only:', err.message)
  }

  const routes = [
    ...STATIC_META,
    ...seoPages.map(p => ({
      path: p.path,
      title: p.title.includes('SécurPats') ? p.title : `${p.title} | SécurPats`,
      description: p.description || p.metaDescription,
      keywords: p.keywords || [],
    })),
  ]

  const seen = new Set()
  let count = 0
  for (const route of routes) {
    if (!route?.path || seen.has(route.path)) continue
    seen.add(route.path)
    const html = injectMeta(baseHtml, route)
    if (route.path === '/') {
      writeFileSync(indexPath, html, 'utf8')
    } else {
      const dir = join(dist, route.path.replace(/^\//, ''))
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'index.html'), html, 'utf8')
    }
    count++
  }
  console.log(`[prerender-seo] ${count} pages HTML SEO générées dans dist/`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
