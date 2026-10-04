import type { CaregiverKind, UserRole } from '@/types'

export type CaregiverSpaceConfig = {
  kind: CaregiverKind
  role: UserRole
  basePath: string
  accent: 'teal' | 'amber'
}

/** Espace unique bénévole + famille d'accueil */
export const CAREGIVER_UNIFIED = {
  basePath: '/aidant',
  accent: 'teal' as const,
  label: 'Bénévole / Famille d’accueil',
}

export const CAREGIVER_SPACES: Record<CaregiverKind, CaregiverSpaceConfig> = {
  foster_family: {
    kind: 'foster_family',
    role: 'foster_family',
    basePath: CAREGIVER_UNIFIED.basePath,
    accent: 'teal',
  },
  volunteer: {
    kind: 'volunteer',
    role: 'volunteer',
    basePath: CAREGIVER_UNIFIED.basePath,
    accent: 'amber',
  },
  both: {
    kind: 'both',
    role: 'foster_family',
    basePath: CAREGIVER_UNIFIED.basePath,
    accent: 'teal',
  },
}

export function caregiverSpaceForRole(role: string): CaregiverSpaceConfig | null {
  if (role === 'foster_family') return CAREGIVER_SPACES.foster_family
  if (role === 'volunteer') return CAREGIVER_SPACES.volunteer
  return null
}

export function homePathForRole(role: string): string {
  if (role === 'admin') return '/admin'
  if (role === 'petsitter') return '/pet-sitter'
  const space = caregiverSpaceForRole(role)
  if (space) return space.basePath
  return '/app'
}

export function isCaregiverRole(role: string): boolean {
  return role === 'foster_family' || role === 'volunteer'
}
