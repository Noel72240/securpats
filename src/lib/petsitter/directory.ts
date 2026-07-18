import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { DirectoryPetsitter } from './directory-types'

type Row = {
  user_id: string
  first_name: string
  last_name: string
  photo: string | null
  bio: string
  phone: string
  email: string
  address: string
  available_days: string[] | null
  available_hours: string
  service_area: string
  department_code?: string | null
}

function fromRow(row: Row): DirectoryPetsitter {
  return {
    userId: row.user_id,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    photo: row.photo ?? undefined,
    bio: row.bio || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    availableDays: row.available_days ?? [],
    availableHours: row.available_hours || '',
    serviceArea: row.service_area || '',
    departmentCode: row.department_code || undefined,
  }
}

export async function fetchVerifiedPetsitters(departmentCode?: string): Promise<{
  sitters: DirectoryPetsitter[]
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { sitters: [], error: 'Supabase non configuré' }

  const params =
    departmentCode && departmentCode.trim()
      ? { p_department_code: departmentCode.trim() }
      : { p_department_code: null }

  const { data, error } = await getSupabase().rpc('list_verified_petsitters', params)
  if (error) {
    const msg = error.message || ''
    if (
      msg.includes('list_verified_petsitters') ||
      error.code === 'PGRST202' ||
      error.code === '42883'
    ) {
      return {
        sitters: [],
        error: 'Fonction absente : exécutez supabase/migrations/023_petsitter_department.sql dans Supabase.',
      }
    }
    return { sitters: [], error: msg }
  }

  return {
    sitters: ((data || []) as Row[]).map(fromRow),
    error: null,
  }
}
