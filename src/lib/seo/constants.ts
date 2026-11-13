export const SITE_URL = 'https://www.securpats.fr'
export const SITE_NAME = 'SécurPats'
/** Image Open Graph JPEG (meilleure compatibilité que SVG). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: DEFAULT_OG_IMAGE,
  },
  image: DEFAULT_OG_IMAGE,
  description:
    "Service de protection animale d'urgence : alerte des référents, QR code secours et prise en charge des animaux en cas d'hospitalisation, d'accident ou d'absence imprévue. Aide animalière organisée pour chiens, chats et NAC.",
  areaServed: { '@type': 'Country', name: 'France' },
  email: 'contact@securpats.fr',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@securpats.fr',
    availableLanguage: ['French', 'fr'],
  },
  foundingDate: '2026',
  slogan: 'Vos animaux toujours protégés, même en votre absence',
}

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ['SecurPats', 'Sécur Pats', 'Securpats'],
  description:
    "Plateforme française d'aide animalière et de protection en urgence : hospitalisation, garde animal, alertes référents.",
  inLanguage: 'fr-FR',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/faq`,
    },
    'query-input': 'required name=search_term_string',
  },
}
