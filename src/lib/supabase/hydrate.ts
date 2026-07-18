import type { Dispatch, SetStateAction } from 'react'
import type { User } from '@/types'
import {
  loadOwnerData, loadAdminData, loadPublicData,
  fetchPetsitterProfile, fetchAllMissions, fetchSubscriptionByOwner, fetchInvoicesByOwner,
} from '@/lib/supabase/services'
import { fetchCaregiverProfile } from '@/lib/caregiver/services'

type Setters = {
  setPets: Dispatch<SetStateAction<import('@/types').Pet[]>>
  setReferents: Dispatch<SetStateAction<import('@/types').Referent[]>>
  setDocuments: Dispatch<SetStateAction<import('@/types').PetDocument[]>>
  setSubscription: Dispatch<SetStateAction<import('@/types').Subscription | null>>
  setInvoices: Dispatch<SetStateAction<import('@/types').Invoice[]>>
  setMissions: Dispatch<SetStateAction<import('@/types').Mission[]>>
  setActivities: Dispatch<SetStateAction<import('@/types').Activity[]>>
  setRegisteredUsers: Dispatch<SetStateAction<User[]>>
  setSiteSettings: Dispatch<SetStateAction<import('@/types').SiteSettings>>
  setPetSitterProfile: Dispatch<SetStateAction<import('@/types').PetSitterProfile | null>>
  setCaregiverProfile: Dispatch<SetStateAction<import('@/types').CaregiverProfile | null>>
  setAllPetsitterProfiles: Dispatch<SetStateAction<import('@/types').PetSitterProfile[]>>
  setAllSubscriptions: Dispatch<SetStateAction<import('@/types').Subscription[]>>
}

export async function hydrateUserData(user: User, setters: Setters) {
  if (user.role === 'admin') {
    const data = await loadAdminData()
    setters.setRegisteredUsers(data.allUsers.filter(u => u.role !== 'admin'))
    setters.setPets(data.pets)
    setters.setReferents(data.referents)
    setters.setDocuments(data.documents)
    setters.setMissions(data.missions)
    setters.setSiteSettings(data.siteSettings)
    setters.setInvoices(data.invoices)
    setters.setAllPetsitterProfiles(data.petsitterProfiles)
    setters.setAllSubscriptions(data.subscriptions)
    return
  }

  if (user.role === 'owner') {
    const data = await loadOwnerData(user.id)
    setters.setPets(data.pets)
    setters.setReferents(data.referents)
    setters.setDocuments(data.documents)
    setters.setSubscription(data.subscription)
    setters.setInvoices(data.invoices)
    setters.setActivities(data.activities)
    setters.setMissions(data.missions)
    return
  }

  if (user.role === 'petsitter') {
    const [profile, missions, subscription, invoices] = await Promise.all([
      fetchPetsitterProfile(user.id),
      fetchAllMissions(),
      fetchSubscriptionByOwner(user.id),
      fetchInvoicesByOwner(user.id),
    ])
    if (profile.profile) setters.setPetSitterProfile(profile.profile)
    setters.setMissions(missions.missions)
    setters.setSubscription(subscription.subscription)
    setters.setInvoices(invoices.invoices)
    return
  }

  if (user.role === 'foster_family' || user.role === 'volunteer') {
    const { profile } = await fetchCaregiverProfile(user.id)
    if (profile) setters.setCaregiverProfile(profile)
  }
}

export async function hydratePublicSite(setSiteSettings: Setters['setSiteSettings']) {
  const { siteSettings } = await loadPublicData()
  setSiteSettings(siteSettings)
}

export function clearUserData(setters: Setters) {
  setters.setPets([])
  setters.setReferents([])
  setters.setDocuments([])
  setters.setSubscription(null)
  setters.setInvoices([])
  setters.setMissions([])
  setters.setActivities([])
  setters.setPetSitterProfile(null)
  setters.setCaregiverProfile(null)
  setters.setAllPetsitterProfiles([])
  setters.setAllSubscriptions([])
}
