import { useEffect } from 'react'
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from '@/lib/seo/constants'

export type PageSEOProps = {
  title: string
  description: string
  path: string
  keywords?: string[]
  faqs?: Array<{ question: string; answer: string }>
  article?: boolean
  /** Pages privées / panier / succès : ne pas indexer */
  noIndex?: boolean
  breadcrumbs?: Array<{ name: string; path: string }>
  articleMeta?: {
    publishedAt?: string | null
    modifiedAt?: string | null
    authorName?: string
    imageUrl?: string
  }
}

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function PageSEO({
  title,
  description,
  path,
  keywords,
  faqs,
  article,
  noIndex,
  breadcrumbs,
  articleMeta,
}: PageSEOProps) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const ogImage = articleMeta?.imageUrl || DEFAULT_OG_IMAGE

    document.title = fullTitle
    upsertMeta('description', description)
    if (keywords?.length) upsertMeta('keywords', keywords.join(', '))
    upsertMeta(
      'robots',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )
    upsertLink('canonical', url)
    let hreflang = document.querySelector('link[rel="alternate"][hreflang="fr"]') as HTMLLinkElement | null
    if (!hreflang) {
      hreflang = document.createElement('link')
      hreflang.rel = 'alternate'
      hreflang.hreflang = 'fr'
      document.head.appendChild(hreflang)
    }
    hreflang.href = url

    upsertMeta('og:title', fullTitle, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:url', url, 'property')
    upsertMeta('og:type', article ? 'article' : 'website', 'property')
    upsertMeta('og:site_name', SITE_NAME, 'property')
    upsertMeta('og:locale', 'fr_FR', 'property')
    upsertMeta('og:image', ogImage, 'property')
    upsertMeta('og:image:alt', fullTitle, 'property')

    if (article && articleMeta?.publishedAt) {
      upsertMeta('article:published_time', articleMeta.publishedAt, 'property')
    }
    if (article && articleMeta?.modifiedAt) {
      upsertMeta('article:modified_time', articleMeta.modifiedAt, 'property')
    }

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', fullTitle)
    upsertMeta('twitter:description', description)
    upsertMeta('twitter:image', ogImage)

    upsertJsonLd('securpats-org-schema', ORGANIZATION_SCHEMA)
    upsertJsonLd('securpats-website-schema', WEBSITE_SCHEMA)

    if (breadcrumbs?.length) {
      upsertJsonLd('securpats-breadcrumb-schema', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          ...breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: b.name,
            item: `${SITE_URL}${b.path}`,
          })),
        ],
      })
    } else {
      document.getElementById('securpats-breadcrumb-schema')?.remove()
    }

    if (article) {
      upsertJsonLd('securpats-page-schema', {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url,
        inLanguage: 'fr-FR',
        datePublished: articleMeta?.publishedAt || undefined,
        dateModified: articleMeta?.modifiedAt || articleMeta?.publishedAt || undefined,
        author: {
          '@type': 'Organization',
          name: articleMeta?.authorName || SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
        },
        image: articleMeta?.imageUrl ? [articleMeta.imageUrl] : [DEFAULT_OG_IMAGE],
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      })
    } else {
      upsertJsonLd('securpats-page-schema', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: fullTitle,
        description,
        url,
        inLanguage: 'fr-FR',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        about: {
          '@type': 'Thing',
          name: 'Protection animale d\'urgence et aide animalière',
        },
      })
    }

    if (faqs?.length) {
      upsertJsonLd('securpats-faq-schema', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      })
    } else {
      document.getElementById('securpats-faq-schema')?.remove()
    }

    upsertJsonLd('securpats-service-schema', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Protection animale d\'urgence et aide animalière SécurPats',
      serviceType: 'Aide animalière / protection animale d\'urgence',
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      areaServed: {
        '@type': 'Country',
        name: 'France',
      },
      description:
        'Alerte automatique des référents, fiche secours QR code et organisation de la prise en charge de votre animal en cas d\'hospitalisation, d\'accident ou d\'urgence. Alternative organisée à l\'improvisation pour la garde chien/chat.',
      offers: {
        '@type': 'Offer',
        price: '4.99',
        priceCurrency: 'EUR',
        url: `${SITE_URL}/tarifs`,
        availability: 'https://schema.org/InStock',
      },
      termsOfService: `${SITE_URL}/cgu`,
    })
  }, [
    title,
    description,
    path,
    keywords,
    faqs,
    article,
    noIndex,
    breadcrumbs,
    articleMeta?.publishedAt,
    articleMeta?.modifiedAt,
    articleMeta?.authorName,
    articleMeta?.imageUrl,
  ])

  return null
}
