/** Constantes & types du formulaire aidant (bénévole / famille d'accueil) */

export const ENGAGEMENT_OPTIONS = [
  { value: 'volunteer', label: 'Bénévole (visites, promenades, transport…)' },
  { value: 'foster_family', label: 'Famille d’accueil' },
] as const

export const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '50', label: '50 km' },
  { value: '100', label: '100 km et +' },
] as const

export const ANIMAL_OPTIONS = [
  { value: 'dogs', label: 'Chiens' },
  { value: 'cats', label: 'Chats' },
  { value: 'nac', label: 'NAC' },
  { value: 'birds', label: 'Oiseaux' },
  { value: 'reptiles', label: 'Reptiles' },
  { value: 'horses', label: 'Chevaux' },
  { value: 'other', label: 'Autres' },
] as const

export const DOG_SIZE_OPTIONS = [
  { value: 'small', label: 'Petit (< 10 kg)' },
  { value: 'medium', label: 'Moyen (10–25 kg)' },
  { value: 'large', label: 'Grand (25–40 kg)' },
  { value: 'xlarge', label: 'Très grand (> 40 kg)' },
  { value: 'any', label: 'Toutes tailles' },
] as const

export const HOUSING_OPTIONS = [
  { value: 'house', label: 'Maison' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'farm', label: 'Ferme' },
  { value: 'other', label: 'Autre' },
] as const

export const AVAILABILITY_OPTIONS = [
  { value: 'year_round', label: 'Toute l’année' },
  { value: 'weekend', label: 'Week-end' },
  { value: 'holidays', label: 'Vacances' },
  { value: 'daytime', label: 'En journée' },
  { value: 'night', label: 'La nuit' },
  { value: 'emergency_only', label: 'Urgences uniquement' },
] as const

export const EMERGENCY_DELAY_OPTIONS = [
  { value: 'under_1h', label: 'Moins d’1 heure' },
  { value: '2h', label: '2 heures' },
  { value: 'half_day', label: 'Demi-journée' },
  { value: '24h', label: '24 heures' },
] as const

export type CaregiverOwnAnimal = {
  species: string
  sex: string
  age: string
  sterilized: boolean | null
  vaccinated: boolean | null
  sociable: boolean | null
}

export type CaregiverQuestionnaire = {
  acceptedAnimals: string[]
  acceptedAnimalsOther: string
  maxAnimals: string
  maxDogSize: string
  acceptMales: boolean | null
  acceptFemales: boolean | null
  sterilizedOnly: boolean | null
  acceptPuppiesKittens: boolean | null
  acceptSenior: boolean | null
  acceptSick: boolean | null
  acceptMedicalTreatments: boolean | null
  acceptDisabled: boolean | null
  acceptCategorized: boolean | null
  acceptUnsociable: boolean | null
  acceptRunaways: boolean | null
  housingType: string
  gardenFenced: boolean | null
  hasStairs: boolean | null
  animalsIndoorAccess: boolean | null
  hasOwnAnimals: boolean | null
  ownAnimals: CaregiverOwnAnimal[]
  hasKeptAnimals: boolean | null
  training: string
  animalRelatedJob: string
  animalAssociation: string
  /** Dispose de l’ACACED (Attestation de connaissances animaux de compagnie) */
  hasAcaced: boolean | null
  availabilityTypes: string[]
  emergencyAvailable: boolean | null
  emergencyDelay: string
}

export type CaregiverDocuments = {
  idDocument?: string
  proofOfAddress?: string
  criminalRecord?: string
  insurance?: string
  housingPhotos: string[]
  outdoorPhotos: string[]
  ownAnimalsPhotos: string[]
}

export const emptyQuestionnaire = (): CaregiverQuestionnaire => ({
  acceptedAnimals: [],
  acceptedAnimalsOther: '',
  maxAnimals: '',
  maxDogSize: '',
  acceptMales: null,
  acceptFemales: null,
  sterilizedOnly: null,
  acceptPuppiesKittens: null,
  acceptSenior: null,
  acceptSick: null,
  acceptMedicalTreatments: null,
  acceptDisabled: null,
  acceptCategorized: null,
  acceptUnsociable: null,
  acceptRunaways: null,
  housingType: '',
  gardenFenced: null,
  hasStairs: null,
  animalsIndoorAccess: null,
  hasOwnAnimals: null,
  ownAnimals: [],
  hasKeptAnimals: null,
  training: '',
  animalRelatedJob: '',
  animalAssociation: '',
  hasAcaced: null,
  availabilityTypes: [],
  emergencyAvailable: null,
  emergencyDelay: '',
})

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined | null,
): string {
  if (!value) return '—'
  return options.find(o => o.value === value)?.label ?? value
}

export function optionLabels(
  options: readonly { value: string; label: string }[],
  values: string[] | undefined | null,
): string {
  if (!values?.length) return '—'
  return values.map(v => optionLabel(options, v)).join(', ')
}

export function yesNoText(value: boolean | null | undefined): string {
  if (value === true) return 'Oui'
  if (value === false) return 'Non'
  return '—'
}

export function engagementToKind(types: string[]): 'foster_family' | 'volunteer' | 'both' {
  const hasV = types.includes('volunteer')
  const hasF = types.includes('foster_family')
  if (hasV && hasF) return 'both'
  if (hasF) return 'foster_family'
  return 'volunteer'
}

export function kindToRole(kind: 'foster_family' | 'volunteer' | 'both'): 'foster_family' | 'volunteer' {
  // « Les deux » → rôle famille d'accueil (espace unifié /aidant pour les deux rôles)
  if (kind === 'volunteer') return 'volunteer'
  return 'foster_family'
}
