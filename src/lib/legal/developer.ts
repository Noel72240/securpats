export const DEVELOPER_INFO = {
  tradeName: 'ALLOTECH72',
  legalStatus: 'Micro-entreprise',
  director: 'Noël Liebault',
  siret: '990 060 972 00017',
  address: {
    line1: '7 rue de la Rentière',
    postalCode: '72450',
    city: 'Lombron',
    country: 'France',
  },
  phone: '06 13 89 39 67',
  email: 'contact@allotech72.fr',
  website: 'https://allotech72.fr',
  logoUrl: '/logo-allotech72.png',
} as const

export const DEVELOPER_FULL_ADDRESS =
  `${DEVELOPER_INFO.address.line1}, ${DEVELOPER_INFO.address.postalCode} ${DEVELOPER_INFO.address.city}, ${DEVELOPER_INFO.address.country}`
