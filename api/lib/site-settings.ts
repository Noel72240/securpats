import { getSupabaseAdmin } from './supabase-admin.js'

const SITE_SETTINGS_ID = 'global'

type MaintenanceSettings = {
  enabled?: boolean
  blockPayments?: boolean
}

export async function arePaymentsBlockedOnServer(): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  const { data, error } = await supabase
    .from('site_settings')
    .select('settings')
    .eq('id', SITE_SETTINGS_ID)
    .maybeSingle()

  if (error || !data?.settings || typeof data.settings !== 'object') return false

  const maintenance = (data.settings as { maintenance?: MaintenanceSettings }).maintenance
  if (!maintenance?.enabled) return false
  return maintenance.blockPayments !== false
}
