import type { SiteMaintenanceMode, SiteSettings } from '@/types'

export function isMaintenanceBannerVisible(settings: SiteSettings): boolean {
  return settings.maintenance.enabled
}

export function arePaymentsBlocked(settings: SiteSettings): boolean {
  const { enabled, blockPayments } = settings.maintenance
  return enabled && blockPayments
}

export function getMaintenanceTitle(mode: SiteMaintenanceMode): string {
  return mode === 'development'
    ? 'Site en cours de développement'
    : 'Maintenance en cours'
}
