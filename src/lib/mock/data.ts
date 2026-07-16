import type { User, Pet, Referent, PetDocument, Mission, PetSitterProfile, Activity, SiteSettings } from '@/types'

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@securpats.fr'

/** Compte admin système (connexion avec l'email configuré dans VITE_ADMIN_EMAIL) */
export const systemUsers: User[] = [
  {
    id: 'admin-system',
    email: adminEmail,
    firstName: 'Admin',
    lastName: 'SécurPats',
    phone: '',
    role: 'admin',
    createdAt: new Date().toISOString().split('T')[0],
    twoFactorEnabled: false,
  },
]

export const mockUsers: User[] = systemUsers

export const mockPets: Pet[] = []
export const mockReferents: Referent[] = []
export const mockDocuments: PetDocument[] = []
export const mockInvoices: import('@/types').Invoice[] = []
export const mockMissions: Mission[] = []
export const mockActivities: Activity[] = []
export const mockPetSitter: PetSitterProfile | null = null

export const defaultSiteSettings: SiteSettings = {
  siteName: 'SécurPats',
  logoUrl: '/logo-securpats-icon.png',
  maintenance: {
    enabled: false,
    mode: 'maintenance',
    message: 'Les paiements sont temporairement suspendus. Merci de votre patience.',
    blockPayments: true,
  },
  contact: {
    email: 'contact@securpats.fr',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'France',
  },
  legal: {
    companyName: 'SécurPats',
    legalForm: '',
    siret: '',
    rcs: '',
    vatNumber: '',
    capital: '',
    directorName: '',
    dpoEmail: 'dpo@securpats.fr',
    hostName: 'Vercel Inc.',
    hostAddress: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    dataHostName: 'Supabase (AWS)',
    dataHostRegion: 'Union européenne',
    mediatorName: '',
    mediatorUrl: 'https://www.economie.gouv.fr/mediation-conso',
  },
  home: {
    badge: 'Protection animale d\'urgence',
    title: 'Vos animaux',
    titleHighlight: 'toujours protégés',
    subtitle: 'Préparez à l\'avance toutes les informations nécessaires pour la prise en charge de vos compagnons en cas d\'hospitalisation, d\'accident ou d\'urgence.',
    heroImage: '',
    heroImageAlt: 'Votre compagnon',
    ctaTitle: 'Protégez vos compagnons dès aujourd\'hui',
    ctaSubtitle: 'Abonnement à partir de 4,99 €/mois — renouvellement automatique.',
  },
  footer: {
    description: 'La plateforme qui garantit qu\'aucun animal ne soit laissé sans prise en charge en cas d\'urgence.',
  },
  testimonials: [],
  partners: {
    enabled: false,
    title: 'Nos partenaires',
    subtitle: 'Des acteurs de confiance qui partagent notre engagement pour la protection animale.',
    items: [],
  },
}

export const faqItems = [
  {
    question: 'Comment fonctionne le QR Code ?',
    answer: 'Chaque animal possède un QR Code unique. En le scannant, un secouriste, un vétérinaire ou toute personne de confiance accède instantanément à la fiche de secours essentielle : traitements, allergies, référents et coordonnées vétérinaires.',
  },
  {
    question: 'Qui peut accéder aux informations ?',
    answer: 'Seules les informations essentielles sont visibles via le QR Code (fiche de secours). Vos documents complets et données personnelles restent privés et accessibles uniquement via votre compte sécurisé.',
  },
  {
    question: 'Que se passe-t-il en cas d\'urgence ?',
    answer: 'En cas d\'urgence déclarée, vos référents prioritaires sont notifiés automatiquement. Si aucun référent n\'est disponible, un pet-sitter de votre zone géographique peut être contacté pour une prise en charge immédiate.',
  },
  {
    question: 'Mes données sont-elles protégées ?',
    answer: 'Absolument. SécurPats respecte le RGPD. Vos données sont chiffrées, hébergées en Europe, et vous gardez le contrôle total : export, modification et suppression à tout moment.',
  },
  {
    question: 'Comment fonctionne l\'abonnement ?',
    answer: 'Deux formules avec renouvellement automatique : 4,99 €/mois ou 49,99 €/an. Le paiement est sécurisé par Stripe. Vous pouvez gérer ou résilier votre abonnement à tout moment depuis votre espace.',
  },
]

export const adminStats = {
  totalUsers: 0,
  totalPets: 0,
  totalMissions: 0,
  totalRevenue: 0,
  monthlyGrowth: [
    { month: 'Jan', users: 0, pets: 0, missions: 0, revenue: 0 },
    { month: 'Fév', users: 0, pets: 0, missions: 0, revenue: 0 },
    { month: 'Mar', users: 0, pets: 0, missions: 0, revenue: 0 },
    { month: 'Avr', users: 0, pets: 0, missions: 0, revenue: 0 },
    { month: 'Mai', users: 0, pets: 0, missions: 0, revenue: 0 },
    { month: 'Juin', users: 0, pets: 0, missions: 0, revenue: 0 },
  ],
}
