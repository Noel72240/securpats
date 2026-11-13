export const SITE_URL = 'https://www.securpats.fr'
export const SITE_NAME = 'SécurPats'
/** Image Open Graph JPEG (meilleure compatibilité que SVG). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: 'SécurPats',
  alternateName: [
    'SecurPats',
    'Securpats',
    'securpats',
    'Sécur Pats',
    'Secur Pats',
  ],
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: DEFAULT_OG_IMAGE,
  },
  image: DEFAULT_OG_IMAGE,
  description:
    "SécurPats est la plateforme française de protection animale d'urgence et d'aide animalière : alertes référents, QR code secours, fiches animaux (chiens, chats, NAC) en cas d'hospitalisation ou d'absence imprévue.",
  disambiguatingDescription:
    "SécurPats (securpats.fr) protège les animaux de compagnie en urgence. Ce n'est pas Sécur'Pass / SecurPass, le service d'authentification bancaire des banques françaises.",
  knowsAbout: [
    'protection animale',
    'aide animalière',
    'garde animal hospitalisation',
    'alerte référents',
    'QR code secours animal',
  ],
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
  brand: {
    '@type': 'Brand',
    name: SITE_NAME,
    alternateName: ['SecurPats', 'securpats'],
    slogan: 'Protection animale d’urgence',
  },
}

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ['SecurPats', 'Sécur Pats', 'Securpats', 'securpats'],
  description:
    "Site officiel SécurPats — plateforme française d'aide animalière et de protection animale en urgence (pas le Sécur'Pass bancaire).",
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
