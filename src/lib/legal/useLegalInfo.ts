import { useApp } from '@/contexts/AppContext'
import { SUBPROCESSORS, LEGAL_VERSION } from './constants'

export function useLegalInfo() {
  const { siteSettings } = useApp()
  const { contact, legal, siteName } = siteSettings

  const fullAddress = [
    contact.addressLine1,
    contact.addressLine2,
    `${contact.postalCode} ${contact.city}`.trim(),
    contact.country,
  ].filter(Boolean).join(', ')

  const publisher = legal.companyName || siteName
  const placeholder = (value: string, fallback: string) => value.trim() || fallback

  return {
    siteName,
    legalVersion: LEGAL_VERSION,
    publisher,
    fullAddress: fullAddress || 'Adresse à compléter dans l\'administration',
    contactEmail: contact.email || 'contact@securpats.fr',
    contactPhone: contact.phone,
    dpoEmail: legal.dpoEmail,
    siret: placeholder(legal.siret, '[SIRET à compléter]'),
    rcs: placeholder(legal.rcs, '[RCS à compléter]'),
    vatNumber: placeholder(legal.vatNumber, '[N° TVA à compléter]'),
    legalForm: placeholder(legal.legalForm, '[Forme juridique à compléter]'),
    capital: placeholder(legal.capital, '[Capital social à compléter]'),
    directorName: placeholder(legal.directorName, '[Directeur de publication à compléter]'),
    hostName: legal.hostName || 'Vercel Inc.',
    hostAddress: legal.hostAddress || '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    dataHostName: legal.dataHostName || 'Supabase (AWS)',
    dataHostRegion: legal.dataHostRegion || 'Union européenne (région eu-west configurée à la création du projet)',
    mediatorName: legal.mediatorName || 'Médiateur de la consommation compétent (à désigner)',
    mediatorUrl: legal.mediatorUrl || 'https://www.economie.gouv.fr/mediation-conso',
    subprocessors: SUBPROCESSORS,
  }
}
