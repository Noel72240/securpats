export const SITE_URL = 'https://www.securpats.fr'
export const SITE_NAME = 'SécurPats'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-securpats-icon.png`

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  description: 'Service de protection animale d\'urgence : alerte des référents, QR code secours et prise en charge des animaux en cas d\'hospitalisation ou d\'absence imprévue.',
  areaServed: { '@type': 'Country', name: 'France' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@securpats.fr',
    availableLanguage: 'French',
  },
}
