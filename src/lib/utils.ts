import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--
    months += 12
  }
  if (years === 0) return `${months} mois`
  if (months === 0) return `${years} an${years > 1 ? 's' : ''}`
  return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
}

/** Âge en années complètes (propriétaires, référents, etc.) */
export function formatHumanAge(birthDate?: string): string {
  if (!birthDate) return '—'
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '—'
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  if (age < 0) return '—'
  return `${age} an${age > 1 ? 's' : ''}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateQrToken(name: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`
}

/** Token QR unique du foyer propriétaire */
export function buildOwnerQrToken(firstName: string, userId: string): string {
  const slug = firstName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'proprietaire'
  return `famille-${slug}-${userId.replace(/-/g, '').slice(0, 8)}`
}

export function getRescueUrl(token: string): string {
  // En navigateur : URL du site actuel → le QR mène toujours à /secours (fiche publique)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/secours/${encodeURIComponent(token)}`
  }
  const envBase = (import.meta.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')
  return `${envBase}/secours/${encodeURIComponent(token)}`
}

/** URL publique de la fiche famille (propriétaire + animaux + référents) */
export function getOwnerRescueUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/famille/${encodeURIComponent(token)}`
  }
  const envBase = (import.meta.env.VITE_APP_URL || 'https://securpats.fr').replace(/\/$/, '')
  return `${envBase}/famille/${encodeURIComponent(token)}`
}
