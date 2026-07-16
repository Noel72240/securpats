export type AdvanceDirectives = {
  id: string
  ownerId: string
  petIds: string[]
  priorityName: string
  priorityPhone: string
  priorityRelation: string
  backupName: string
  backupPhone: string
  backupRelation: string
  tertiaryName: string
  tertiaryPhone: string
  tertiaryRelation: string
  allowPartnerShelter: boolean
  allowFosterFamily: boolean
  peopleToNotify: string
  specialInstructions: string
  medication: string
  feedingHabits: string
  dailyHabits: string
  veterinarianInfo: string
  signedFullName: string
  signatureData: string
  consentAccepted: boolean
  consentVersion: string
  signedAt: string | null
  createdAt: string
  updatedAt: string
}

export function emptyAdvanceDirectives(ownerId = ''): Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    ownerId,
    petIds: [],
    priorityName: '',
    priorityPhone: '',
    priorityRelation: '',
    backupName: '',
    backupPhone: '',
    backupRelation: '',
    tertiaryName: '',
    tertiaryPhone: '',
    tertiaryRelation: '',
    allowPartnerShelter: false,
    allowFosterFamily: false,
    peopleToNotify: '',
    specialInstructions: '',
    medication: '',
    feedingHabits: '',
    dailyHabits: '',
    veterinarianInfo: '',
    signedFullName: '',
    signatureData: '',
    consentAccepted: false,
    consentVersion: '',
    signedAt: null,
  }
}
