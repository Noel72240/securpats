import type { CaregiverKind, UserRole } from '@/types'

export type CaregiverSpaceConfig = {
  kind: CaregiverKind
  role: UserRole
  basePath: string
  accent: 'teal' | 'amber'
}

export const CAREGIVER_SPACES: Record<CaregiverKind, CaregiverSpaceConfig> = {
  foster_family: {
    kind: 'foster_family',
    role: 'foster_family',
    basePath: '/famille-accueil',
    accent: 'teal',
  },
  volunteer: {
    kind: 'volunteer',
    role: 'volunteer',
    basePath: '/benevole',
    accent: 'amber',
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
