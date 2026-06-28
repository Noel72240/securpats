export type UserRole = 'owner' | 'petsitter' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address?: string
  birthDate?: string
  role: UserRole
  avatar?: string
  createdAt: string
  twoFactorEnabled: boolean
  /** Consentement CGU / confidentialité (RGPD art. 7) */
  consentAcceptedAt?: string
  consentVersion?: string
  marketingOptIn?: boolean
}

export interface Pet {
  id: string
  ownerId: string
  photo?: string
  name: string
  species: string
  breed: string
  sex: 'Mâle' | 'Femelle'
  birthDate: string
  weight: number
  color: string
  identificationNumber: string
  treatments: string
  allergies: string
  diet: string
  specialInstructions: string
  vetName: string
  vetPhone: string
  vetAddress: string
  qrToken: string
  createdAt: string
}

export interface Referent {
  id: string
  ownerId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  priority: number
}

export type DocumentCategory =
  | 'carnet_sante'
  | 'ordonnance'
  | 'facture'
  | 'assurance'
  | 'divers'

export interface PetDocument {
  id: string
  ownerId: string
  petId?: string
  name: string
  category: DocumentCategory
  fileName: string
  fileSize: number
  uploadedAt: string
  storagePath?: string
}

export type SubscriptionPlan = 'monthly' | 'yearly' | 'petsitter_vip'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  ownerId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  price: number
  startDate: string
  renewalDate: string
  autoRenew: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface Invoice {
  id: string
  ownerId: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'failed'
  plan: SubscriptionPlan
  stripeInvoiceId?: string
}

export type MissionStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'

export interface Mission {
  id: string
  petId: string
  petName: string
  ownerId: string
  ownerName: string
  petsitterId?: string
  type: 'urgence' | 'garde'
  status: MissionStatus
  description: string
  createdAt: string
  address: string
}

export interface PetSitterProfile {
  id: string
  userId: string
  photo?: string
  bio: string
  phone: string
  email: string
  address: string
  idDocument?: string
  proofOfAddress?: string
  availableDays: string[]
  availableHours: string
  serviceArea: string
  verified: boolean
  /** Consentement RGPD — traitement pièce d'identité */
  idConsentAt?: string
  idConsentVersion?: string
}

export interface Activity {
  id: string
  ownerId: string
  type: string
  message: string
  date: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string
}

export const DOCUMENT_LABELS: Record<DocumentCategory, string> = {
  carnet_sante: 'Carnet de santé',
  ordonnance: 'Ordonnances',
  facture: 'Factures vétérinaires',
  assurance: 'Contrats d\'assurance',
  divers: 'Documents divers',
}

export const PLAN_PRICES = {
  monthly: 4.99,
  yearly: 49.99,
  petsitter_vip: 9.90,
} as const

export interface SiteTestimonial {
  id: string
  name: string
  role: string
  text: string
  avatar: string
}

export type SiteMaintenanceMode = 'development' | 'maintenance'

export interface SiteMaintenanceSettings {
  /** Affiche une bannière sur tout le site */
  enabled: boolean
  /** Type de bannière affichée */
  mode: SiteMaintenanceMode
  /** Message personnalisé sous le titre de la bannière */
  message: string
  /** Bloque les paiements Stripe (checkout) quand la bannière est active */
  blockPayments: boolean
}

export interface SiteSettings {
  siteName: string
  logoUrl: string
  maintenance: SiteMaintenanceSettings
  contact: {
    email: string
    phone: string
    addressLine1: string
    addressLine2: string
    city: string
    postalCode: string
    country: string
  }
  legal: {
    companyName: string
    legalForm: string
    siret: string
    rcs: string
    vatNumber: string
    capital: string
    directorName: string
    dpoEmail: string
    hostName: string
    hostAddress: string
    dataHostName: string
    dataHostRegion: string
    mediatorName: string
    mediatorUrl: string
  }
  home: {
    badge: string
    title: string
    titleHighlight: string
    subtitle: string
    heroImage: string
    heroImageAlt: string
    ctaTitle: string
    ctaSubtitle: string
  }
  footer: {
    description: string
  }
  testimonials: SiteTestimonial[]
}
