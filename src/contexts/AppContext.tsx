import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import type { User, Pet, Referent, PetDocument, Subscription, Invoice, Mission, PetSitterProfile, Activity, SiteSettings, SiteTestimonial } from '@/types'
import type { OwnerSubscriptionPlan } from '@/lib/stripe/plans'
import { PLAN_PRICES } from '@/types'
import { notifyReferentsEmergency } from '@/lib/emergency/notify'
import {
  systemUsers, mockPets, mockReferents, mockDocuments,
  mockInvoices, mockMissions, mockPetSitter, mockActivities,
  defaultSiteSettings,
} from '@/lib/mock/data'
import { generateId, generateQrToken } from '@/lib/utils'
import { LEGAL_VERSION } from '@/lib/legal/constants'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { missionFromRow } from '@/lib/supabase/mappers'
import type { Tables } from '@/lib/supabase/database.types'
import { signIn, signUp, signOut, getSessionUser, onAuthStateChange } from '@/lib/supabase/auth'
import * as db from '@/lib/supabase/services'
import { hydrateUserData, hydratePublicSite, clearUserData } from '@/lib/supabase/hydrate'
import { isOwnerSubscriptionActive, isPetsitterVipActive } from '@/lib/subscription/access'
import { reconcileSubscriptionAccess } from '@/lib/stripe/client'
import { uploadPetSitterDocFile } from '@/lib/supabase/uploads'
import { validatePetsitterIdFile } from '@/lib/petsitter/validation'
import { formatPetsitterDbError } from '@/lib/petsitter/db-errors'

interface AppState {
  currentUser: User | null
  pets: Pet[]
  referents: Referent[]
  documents: PetDocument[]
  subscription: Subscription | null
  invoices: Invoice[]
  allSubscriptions: Subscription[]
  missions: Mission[]
  petSitterProfile: PetSitterProfile | null
  allPetsitterProfiles: PetSitterProfile[]
  activities: Activity[]
  allUsers: User[]
  registeredUsers: User[]
  siteSettings: SiteSettings
  authLoading: boolean
  isSupabaseMode: boolean
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    consent: { termsAccepted: boolean; privacyAccepted: boolean; marketingOptIn?: boolean }
  }) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>
  registerPetsitter: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    address: string
    bio: string
    idFile: File
    proofFile?: File | null
    consent: {
      termsAccepted: boolean
      privacyAccepted: boolean
      idProcessingAccepted: boolean
      marketingOptIn?: boolean
    }
  }) => Promise<{ error: string | null; needsEmailConfirmation?: boolean; message?: string }>
  completePetsitterIdentity: (data: {
    idFile: File
    proofFile?: File | null
    address?: string
    bio?: string
    idProcessingAccepted: boolean
  }) => Promise<{ error: string | null }>
  exportUserData: () => Record<string, unknown>
  deleteAccount: () => Promise<boolean>
  deleteUserAsAdmin: (userId: string) => Promise<string | null>
  addPet: (pet: Omit<Pet, 'id' | 'ownerId' | 'qrToken' | 'createdAt'>) => Promise<Pet | null>
  updatePet: (id: string, pet: Partial<Pet>) => void
  deletePet: (id: string) => void
  addReferent: (ref: Omit<Referent, 'id' | 'ownerId' | 'priority'>) => void
  updateReferent: (id: string, ref: Partial<Referent>) => void
  deleteReferent: (id: string) => void
  reorderReferents: (ids: string[]) => void
  addDocument: (doc: Omit<PetDocument, 'id' | 'ownerId' | 'uploadedAt'>, storagePath?: string) => Promise<string | null>
  deleteDocument: (id: string) => void
  declareEmergency: (petId: string, description: string) => Promise<{ ok: boolean; emailsSent: number; error?: string; emailConfigured?: boolean; results?: { email: string; sent: boolean; error?: string }[] }>
  updateMissionStatus: (id: string, status: Mission['status']) => Promise<string | null>
  deleteMission: (id: string) => Promise<string | null>
  cancelMission: (id: string) => Promise<string | null>
  deleteActivity: (id: string) => Promise<string | null>
  setPetsitterVerified: (userId: string, verified: boolean) => Promise<string | null>
  updateSubscription: (plan: OwnerSubscriptionPlan) => void
  syncSubscriptionFromStripe: (data: Omit<Subscription, 'id' | 'ownerId'> & { ownerId?: string }) => void
  cancelSubscription: () => void
  updatePetSitterProfile: (profile: Partial<PetSitterProfile>) => void
  updateOwnerProfile: (updates: db.OwnerProfilePatch) => Promise<string | null>
  addActivity: (type: string, message: string) => void
  updateSiteSettings: (updates: Partial<SiteSettings>) => void
  resetSiteSettings: () => void
  addTestimonial: (testimonial: Omit<SiteTestimonial, 'id'>) => void
  updateTestimonial: (id: string, updates: Partial<SiteTestimonial>) => void
  deleteTestimonial: (id: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = 'securpats_state_v3'
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@securpats.fr'
const supabaseMode = isSupabaseConfigured()

function loadState(): Partial<AppState> {
  if (supabaseMode) return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveState(state: Partial<AppState>) {
  if (supabaseMode) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = loadState()

  const [authLoading, setAuthLoading] = useState(supabaseMode)
  const [currentUser, setCurrentUser] = useState<User | null>(saved.currentUser ?? null)
  const [pets, setPets] = useState<Pet[]>(saved.pets ?? mockPets)
  const [referents, setReferents] = useState<Referent[]>(saved.referents ?? mockReferents)
  const [documents, setDocuments] = useState<PetDocument[]>(saved.documents ?? mockDocuments)
  const [subscription, setSubscription] = useState<Subscription | null>(saved.subscription ?? null)
  const [invoices, setInvoices] = useState<Invoice[]>(saved.invoices ?? mockInvoices)
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [missions, setMissions] = useState<Mission[]>(saved.missions ?? mockMissions)
  const [petSitterProfile, setPetSitterProfile] = useState<PetSitterProfile | null>(saved.petSitterProfile ?? mockPetSitter)
  const [allPetsitterProfiles, setAllPetsitterProfiles] = useState<PetSitterProfile[]>([])
  const [activities, setActivities] = useState<Activity[]>(saved.activities ?? mockActivities)
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(saved.registeredUsers ?? [])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(saved.siteSettings ?? defaultSiteSettings)

  const allUsers = [...systemUsers, ...registeredUsers]

  const dataSetters = useMemo(() => ({
    setPets, setReferents, setDocuments, setSubscription, setInvoices,
    setMissions, setActivities, setRegisteredUsers, setSiteSettings, setPetSitterProfile, setAllPetsitterProfiles, setAllSubscriptions,
  }), [])

  const syncOwnerSubscriptionInBackground = useCallback(async (user: User) => {
    if (user.role === 'owner') {
      const result = await reconcileSubscriptionAccess(user.id)
      if (result.activated) {
        await hydrateUserData(user, dataSetters)
      }
      return
    }
    if (user.role === 'petsitter') {
      const { reconcilePetsitterVipAccess } = await import('@/lib/stripe/client')
      const result = await reconcilePetsitterVipAccess(user.id)
      if (result.activated) {
        await hydrateUserData(user, dataSetters)
      }
    }
  }, [dataSetters])

  // Init Supabase session + site public
  useEffect(() => {
    if (!supabaseMode) {
      setAuthLoading(false)
      return
    }

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    const safetyTimer = window.setTimeout(() => {
      if (!cancelled) setAuthLoading(false)
    }, 10_000)

    const init = async () => {
      try {
        void hydratePublicSite(setSiteSettings)

        const { user } = await getSessionUser()
        if (cancelled) return

        if (user) {
          setCurrentUser(user)
          await hydrateUserData(user, dataSetters)
          void syncOwnerSubscriptionInBackground(user)
        }
      } catch (err) {
        console.error('[Supabase] Init session:', err)
      } finally {
        if (!cancelled) setAuthLoading(false)
      }

      if (!cancelled) {
        unsubscribe = onAuthStateChange(async (user) => {
          if (user) {
            setCurrentUser(user)
            await hydrateUserData(user, dataSetters)
            void syncOwnerSubscriptionInBackground(user)
          } else {
            setCurrentUser(null)
            clearUserData(dataSetters)
          }
        })
      }
    }

    void init()

    return () => {
      cancelled = true
      window.clearTimeout(safetyTimer)
      unsubscribe?.()
    }
  }, [dataSetters, syncOwnerSubscriptionInBackground])

  // Missions en temps réel pour les pet-sitters (retrait immédiat si un collègue accepte)
  useEffect(() => {
    if (!supabaseMode || currentUser?.role !== 'petsitter') return

    const uid = currentUser.id
    const supabase = getSupabase()
    const channel = supabase
      .channel(`missions-petsitter-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id?: string }).id
          if (oldId) setMissions(prev => prev.filter(m => m.id !== oldId))
          return
        }
        const mission = missionFromRow(payload.new as Tables<'missions'>)
        const isMine = mission.petsitterId === uid
        const isOpen = mission.status === 'pending' && !mission.petsitterId
        setMissions(prev => {
          if (!isMine && !isOpen) return prev.filter(m => m.id !== mission.id)
          const idx = prev.findIndex(m => m.id === mission.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = mission
            return next
          }
          return [mission, ...prev]
        })
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUser?.id, currentUser?.role])

  useEffect(() => {
    if (supabaseMode) return
    saveState({
      currentUser, pets, referents, documents, subscription, invoices,
      missions, petSitterProfile, activities, registeredUsers, siteSettings,
    })
  }, [currentUser, pets, referents, documents, subscription, invoices, missions, petSitterProfile, activities, registeredUsers, siteSettings])

  const addActivity = useCallback((type: string, message: string) => {
    if (!currentUser) return
    if (supabaseMode) {
      db.createActivity(currentUser.id, type, message).then(({ activity }) => {
        if (activity) setActivities(prev => [activity, ...prev])
      })
      return
    }
    const activity: Activity = {
      id: generateId('act'),
      ownerId: currentUser.id,
      type,
      message,
      date: new Date().toISOString(),
    }
    setActivities(prev => [activity, ...prev])
  }, [currentUser])

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    if (!password) return null

    if (supabaseMode) {
      const { user, error } = await signIn(email, password)
      if (error || !user) return null
      setCurrentUser(user)
      await hydrateUserData(user, dataSetters)
      void syncOwnerSubscriptionInBackground(user)
      return user
    }

    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (user) {
      setCurrentUser(user)
      return user
    }
    return null
  }, [allUsers, dataSetters, syncOwnerSubscriptionInBackground])

  const logout = useCallback(async () => {
    if (supabaseMode) await signOut()
    setCurrentUser(null)
    if (supabaseMode) clearUserData(dataSetters)
  }, [dataSetters])

  const register = useCallback(async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    consent: { termsAccepted: boolean; privacyAccepted: boolean; marketingOptIn?: boolean }
  }): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    if (!data.consent.termsAccepted || !data.consent.privacyAccepted) {
      return { error: 'Vous devez accepter les CGU et la politique de confidentialité.' }
    }

    const consentAt = new Date().toISOString()

    if (supabaseMode) {
      const { consent, ...signupData } = data
      const { user, error, needsEmailConfirmation } = await signUp({
        ...signupData,
        consentAt,
        consentVersion: LEGAL_VERSION,
        marketingOptIn: consent.marketingOptIn,
      })
      if (needsEmailConfirmation) {
        return { error: null, needsEmailConfirmation: true }
      }
      if (error || !user) {
        if (error?.toLowerCase().includes('database error saving new user')) {
          return { error: 'Erreur base de données à l\'inscription. Exécutez supabase/migrations/005_fix_signup_trigger.sql dans Supabase SQL Editor, puis réessayez.' }
        }
        if (error?.toLowerCase().includes('already registered')) {
          return { error: 'Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.' }
        }
        if (error?.toLowerCase().includes('rate limit')) {
          return {
            error: 'Trop de tentatives d\'inscription. Attendez 15–60 min, connectez-vous si le compte existe déjà, ou désactivez « Confirm email » dans Supabase (Auth → Email) pour le dev.',
          }
        }
        return { error: error || 'Inscription échouée. Réessayez.' }
      }
      setCurrentUser(user)
      return { error: null }
    }

    if (allUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { error: 'Un compte existe déjà avec cet email.' }
    }
    const isAdmin = data.email.toLowerCase() === adminEmail.toLowerCase()
    const newUser: User = {
      id: generateId('user'),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: isAdmin ? 'admin' : 'owner',
      createdAt: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false,
      consentAcceptedAt: consentAt,
      consentVersion: LEGAL_VERSION,
      marketingOptIn: data.consent.marketingOptIn ?? false,
    }
    setRegisteredUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    return { error: null }
  }, [allUsers])

  const finishPetsitterProfileSetup = useCallback(async (
    user: User,
    data: {
      phone: string
      email: string
      address: string
      bio: string
      idFile: File
      proofFile?: File | null
    },
    consentAt: string,
  ): Promise<{ error: string | null }> => {
    const idErr = validatePetsitterIdFile(data.idFile)
    if (idErr) return { error: idErr }

    const { path: idPath, error: idUploadErr } = await uploadPetSitterDocFile(user.id, 'id', data.idFile)
    if (!idPath) {
      return {
        error: `Inscription refusée : la pièce d'identité est obligatoire et n'a pas pu être enregistrée.${idUploadErr ? ` (${idUploadErr})` : ''}`,
      }
    }

    let proofPath: string | undefined
    if (data.proofFile) {
      const { path, error: proofErr } = await uploadPetSitterDocFile(user.id, 'address', data.proofFile)
      if (!path) {
        return { error: proofErr || 'Échec de l\'envoi du justificatif de domicile.' }
      }
      proofPath = path
    }

    const { profile, error: profileErr } = await db.upsertPetsitterProfile(user.id, {
      bio: data.bio,
      phone: data.phone,
      email: data.email,
      address: data.address,
      idDocument: idPath,
      proofOfAddress: proofPath,
      verified: false,
      idConsentAt: consentAt,
      idConsentVersion: LEGAL_VERSION,
    })

    if (profileErr || !profile) {
      return { error: profileErr ? formatPetsitterDbError(profileErr) : 'Profil pet-sitter non enregistré.' }
    }

    setPetSitterProfile(profile)
    return { error: null }
  }, [])

  const registerPetsitter = useCallback(async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    address: string
    bio: string
    idFile: File
    proofFile?: File | null
    consent: {
      termsAccepted: boolean
      privacyAccepted: boolean
      idProcessingAccepted: boolean
      marketingOptIn?: boolean
    }
  }): Promise<{ error: string | null; needsEmailConfirmation?: boolean; message?: string }> => {
    if (!data.consent.termsAccepted || !data.consent.privacyAccepted || !data.consent.idProcessingAccepted) {
      return { error: 'Vous devez accepter les CGU, la politique de confidentialité et le traitement de votre pièce d\'identité.' }
    }

    const idErr = validatePetsitterIdFile(data.idFile)
    if (idErr) return { error: idErr }

    const consentAt = new Date().toISOString()

    if (supabaseMode) {
      const { user, error, needsEmailConfirmation } = await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'petsitter',
        consentAt,
        consentVersion: LEGAL_VERSION,
        marketingOptIn: data.consent.marketingOptIn,
      })

      if (needsEmailConfirmation) {
        return {
          error: null,
          needsEmailConfirmation: true,
          message: 'Compte pet-sitter créé. Confirmez votre email, puis reconnectez-vous pour envoyer votre pièce d\'identité et finaliser l\'inscription (obligatoire).',
        }
      }

      if (error || !user) {
        if (error?.toLowerCase().includes('already registered')) {
          return { error: 'Un compte existe déjà avec cet email. Connectez-vous pour finaliser votre inscription pet-sitter.' }
        }
        return { error: error || 'Inscription échouée.' }
      }

      const setup = await finishPetsitterProfileSetup(user, data, consentAt)
      if (setup.error) return { error: setup.error }

      setCurrentUser(user)
      return { error: null }
    }

    if (allUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { error: 'Un compte existe déjà avec cet email.' }
    }

    const newUser: User = {
      id: generateId('user'),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: 'petsitter',
      createdAt: new Date().toISOString().split('T')[0],
      twoFactorEnabled: false,
      consentAcceptedAt: consentAt,
      consentVersion: LEGAL_VERSION,
      marketingOptIn: data.consent.marketingOptIn ?? false,
    }
    setRegisteredUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    setPetSitterProfile({
      id: generateId('ps'),
      userId: newUser.id,
      bio: data.bio,
      phone: data.phone,
      email: data.email,
      address: data.address,
      idDocument: data.idFile.name,
      proofOfAddress: data.proofFile?.name,
      availableDays: [],
      availableHours: '',
      serviceArea: '',
      verified: false,
      idConsentAt: consentAt,
      idConsentVersion: LEGAL_VERSION,
    })
    return { error: null }
  }, [allUsers, finishPetsitterProfileSetup])

  const completePetsitterIdentity = useCallback(async (data: {
    idFile: File
    proofFile?: File | null
    address?: string
    bio?: string
    idProcessingAccepted: boolean
  }): Promise<{ error: string | null }> => {
    if (!currentUser || currentUser.role !== 'petsitter') {
      return { error: 'Connectez-vous avec un compte pet-sitter.' }
    }
    if (!data.idProcessingAccepted) {
      return { error: 'Vous devez accepter le traitement de votre pièce d\'identité.' }
    }

    const consentAt = new Date().toISOString()
    const profileData = {
      phone: currentUser.phone,
      email: currentUser.email,
      address: data.address ?? petSitterProfile?.address ?? '',
      bio: data.bio ?? petSitterProfile?.bio ?? '',
      idFile: data.idFile,
      proofFile: data.proofFile,
    }

    if (supabaseMode) {
      const result = await finishPetsitterProfileSetup(currentUser, profileData, consentAt)
      return result
    }

    setPetSitterProfile(prev => ({
      id: prev?.id ?? generateId('ps'),
      userId: currentUser.id,
      bio: profileData.bio,
      phone: profileData.phone,
      email: profileData.email,
      address: profileData.address,
      idDocument: data.idFile.name,
      proofOfAddress: data.proofFile?.name ?? prev?.proofOfAddress,
      availableDays: prev?.availableDays ?? [],
      availableHours: prev?.availableHours ?? '',
      serviceArea: prev?.serviceArea ?? '',
      verified: false,
      idConsentAt: consentAt,
      idConsentVersion: LEGAL_VERSION,
    }))
    return { error: null }
  }, [currentUser, petSitterProfile, finishPetsitterProfileSetup])

  const exportUserData = useCallback((): Record<string, unknown> => {
    if (!currentUser) return {}
    const ownerPets = pets.filter(p => p.ownerId === currentUser.id)
    const ownerRefs = referents.filter(r => r.ownerId === currentUser.id)
    const ownerDocs = documents.filter(d => d.ownerId === currentUser.id)
    const ownerInvoices = invoices.filter(i => i.ownerId === currentUser.id)
    const ownerActivities = activities.filter(a => a.ownerId === currentUser.id)
    return {
      exportedAt: new Date().toISOString(),
      legalVersion: LEGAL_VERSION,
      profile: currentUser,
      pets: ownerPets,
      referents: ownerRefs,
      documents: ownerDocs.map(d => ({ ...d, note: 'Les fichiers binaires ne sont pas inclus dans l\'export JSON' })),
      subscription,
      invoices: ownerInvoices,
      activities: ownerActivities,
    }
  }, [currentUser, pets, referents, documents, subscription, invoices, activities])

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!currentUser || currentUser.role === 'admin') return false

    if (supabaseMode) {
      const { getSupabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) return false

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: currentUser.id, email: currentUser.email }),
      })

      if (!response.ok) return false
      setCurrentUser(null)
      clearUserData(dataSetters)
      return true
    }

    setPets(prev => prev.filter(p => p.ownerId !== currentUser.id))
    setReferents(prev => prev.filter(r => r.ownerId !== currentUser.id))
    setDocuments(prev => prev.filter(d => d.ownerId !== currentUser.id))
    setInvoices(prev => prev.filter(i => i.ownerId !== currentUser.id))
    setActivities(prev => prev.filter(a => a.ownerId !== currentUser.id))
    setSubscription(null)
    setRegisteredUsers(prev => prev.filter(u => u.id !== currentUser.id))
    setCurrentUser(null)
    return true
  }, [currentUser, dataSetters])

  const deleteUserAsAdmin = useCallback(async (userId: string): Promise<string | null> => {
    if (currentUser?.role !== 'admin') return 'Action réservée aux administrateurs'

    const target = allUsers.find(u => u.id === userId)
    if (!target) return 'Utilisateur introuvable'
    if (target.role === 'admin') return 'Impossible de supprimer un compte administrateur'

    if (supabaseMode) {
      const { getSupabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session?.access_token) return 'Session expirée, reconnectez-vous'

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ targetUserId: userId }),
      })

      const body = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) return body.error || 'Suppression échouée'

      await hydrateUserData(currentUser, dataSetters)
      return null
    }

    setRegisteredUsers(prev => prev.filter(u => u.id !== userId))
    setPets(prev => prev.filter(p => p.ownerId !== userId))
    setReferents(prev => prev.filter(r => r.ownerId !== userId))
    setDocuments(prev => prev.filter(d => d.ownerId !== userId))
    setInvoices(prev => prev.filter(i => i.ownerId !== userId))
    setAllSubscriptions(prev => prev.filter(s => s.ownerId !== userId))
    setMissions(prev => prev.filter(m => m.ownerId !== userId && m.petsitterId !== userId))
    setAllPetsitterProfiles(prev => prev.filter(p => p.userId !== userId))
    return null
  }, [currentUser, allUsers, dataSetters])

  const addPet = useCallback(async (pet: Omit<Pet, 'id' | 'ownerId' | 'qrToken' | 'createdAt'>): Promise<Pet | null> => {
    if (!currentUser) return null
    if (supabaseMode) {
      const { pet: created } = await db.createPet(currentUser.id, pet)
      if (created) {
        setPets(prev => [...prev, created])
        addActivity('pet', `Animal ${pet.name} ajouté`)
        return created
      }
      return null
    }
    const newPet: Pet = {
      ...pet,
      id: generateId('pet'),
      ownerId: currentUser.id,
      qrToken: generateQrToken(pet.name),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPets(prev => [...prev, newPet])
    addActivity('pet', `Animal ${pet.name} ajouté`)
    return newPet
  }, [currentUser, addActivity])

  const updatePet = useCallback((id: string, updates: Partial<Pet>) => {
    if (supabaseMode) {
      db.updatePet(id, updates).then(({ pet }) => {
        if (pet) setPets(prev => prev.map(p => p.id === id ? pet : p))
      })
    } else {
      setPets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }
    addActivity('pet', 'Fiche animal mise à jour')
  }, [addActivity])

  const deletePet = useCallback((id: string) => {
    const pet = pets.find(p => p.id === id)
    if (supabaseMode) db.deletePet(id)
    setPets(prev => prev.filter(p => p.id !== id))
    if (pet) addActivity('pet', `Animal ${pet.name} supprimé`)
  }, [pets, addActivity])

  const addReferent = useCallback((ref: Omit<Referent, 'id' | 'ownerId' | 'priority'>) => {
    if (!currentUser) return
    const ownerRefs = referents.filter(r => r.ownerId === currentUser.id)
    if (ownerRefs.length >= 5) return
    const priority = ownerRefs.length + 1

    if (supabaseMode) {
      db.createReferent(currentUser.id, { ...ref, priority } as Referent).then(({ referent }) => {
        if (referent) {
          setReferents(prev => [...prev, referent])
          addActivity('referent', `Référent ${ref.firstName} ${ref.lastName} ajouté`)
        }
      })
      return
    }
    const newRef: Referent = { ...ref, id: generateId('ref'), ownerId: currentUser.id, priority }
    setReferents(prev => [...prev, newRef])
    addActivity('referent', `Référent ${ref.firstName} ${ref.lastName} ajouté`)
  }, [currentUser, referents, addActivity])

  const updateReferent = useCallback((id: string, updates: Partial<Referent>) => {
    if (supabaseMode) db.updateReferent(id, updates).then(({ referent }) => {
      if (referent) setReferents(prev => prev.map(r => r.id === id ? referent : r))
    })
    else setReferents(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  const deleteReferent = useCallback((id: string) => {
    if (supabaseMode) db.deleteReferent(id)
    setReferents(prev => {
      const filtered = prev.filter(r => r.id !== id)
      const ownerId = currentUser?.id
      const ownerRefs = filtered.filter(r => r.ownerId === ownerId).sort((a, b) => a.priority - b.priority)
      return filtered.map(r => {
        const idx = ownerRefs.findIndex(or => or.id === r.id)
        return idx >= 0 ? { ...r, priority: idx + 1 } : r
      })
    })
  }, [currentUser])

  const reorderReferents = useCallback((ids: string[]) => {
    if (supabaseMode) db.reorderReferents(ids)
    setReferents(prev => prev.map(r => {
      const idx = ids.indexOf(r.id)
      return idx >= 0 ? { ...r, priority: idx + 1 } : r
    }))
  }, [])

  const addDocument = useCallback(async (
    doc: Omit<PetDocument, 'id' | 'ownerId' | 'uploadedAt'>,
    storagePath?: string,
  ): Promise<string | null> => {
    if (!currentUser) return 'Non connecté'
    if (supabaseMode) {
      const { document, error } = await db.createDocument(currentUser.id, doc, storagePath)
      if (error || !document) return error || 'Enregistrement du document échoué'
      setDocuments(prev => [...prev, document])
      addActivity('document', `Document "${doc.name}" uploadé`)
      return null
    }
    const newDoc: PetDocument = {
      ...doc,
      id: generateId('doc'),
      ownerId: currentUser.id,
      uploadedAt: new Date().toISOString().split('T')[0],
      storagePath,
    }
    setDocuments(prev => [...prev, newDoc])
    addActivity('document', `Document "${doc.name}" uploadé`)
    return null
  }, [currentUser, addActivity])

  const deleteDocument = useCallback((id: string) => {
    if (supabaseMode) db.deleteDocument(id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }, [])

  const declareEmergency = useCallback(async (petId: string, description: string) => {
    if (!currentUser) return { ok: false, emailsSent: 0, error: 'Non connecté' }
    const pet = pets.find(p => p.id === petId)
    if (!pet) return { ok: false, emailsSent: 0, error: 'Animal introuvable' }

    const ownerReferents = referents
      .filter(r => r.ownerId === currentUser.id)
      .sort((a, b) => a.priority - b.priority)

    const missionData: Omit<Mission, 'id' | 'createdAt'> = {
      petId,
      petName: pet.name,
      ownerId: currentUser.id,
      ownerName: `${currentUser.firstName} ${currentUser.lastName}`,
      type: 'urgence',
      status: 'pending',
      description,
      address: ownerReferents.find(r => r.priority === 1)?.address || '',
    }

    if (supabaseMode) {
      const { mission } = await db.createMission(missionData)
      if (mission) setMissions(prev => [mission, ...prev])
    } else {
      setMissions(prev => [{ ...missionData, id: generateId('mission'), createdAt: new Date().toISOString() }, ...prev])
    }

    addActivity('urgence', `Urgence déclarée pour ${pet.name}`)

    if (supabaseMode && ownerReferents.length > 0) {
      const notify = await notifyReferentsEmergency({
        userId: currentUser.id,
        ownerEmail: currentUser.email,
        petName: pet.name,
        description,
        referents: ownerReferents.map(r => ({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          phone: r.phone,
        })),
      })

      if (!notify.emailConfigured) {
        return {
          ok: true,
          emailsSent: 0,
          emailConfigured: false,
          error: notify.error || 'Emails non configurés (ajoutez RESEND_API_KEY sur Vercel). Les référents doivent être contactés par téléphone.',
        }
      }

      return {
        ok: true,
        emailsSent: notify.emailsSent,
        emailConfigured: true,
        error: notify.emailsSent === 0 ? (notify.error || 'Aucun email envoyé — vérifiez les adresses de vos référents') : undefined,
        results: notify.results,
      }
    }

    return { ok: true, emailsSent: 0, emailConfigured: false }
  }, [currentUser, pets, referents, addActivity])

  const updateMissionStatus = useCallback(async (id: string, status: Mission['status']): Promise<string | null> => {
    if (currentUser?.role === 'petsitter' && !petSitterProfile?.verified) {
      if (status === 'accepted' || status === 'declined' || status === 'completed') {
        return 'Votre compte doit être validé par SécurPats avant de gérer des missions.'
      }
    }

    const applyLocal = (mission: Mission) => {
      setMissions(prev => prev.map(m => m.id === id ? mission : m))
    }

    if (supabaseMode) {
      const petsitterId = currentUser?.role === 'petsitter' ? currentUser.id : undefined
      const { mission, error } = await db.updateMissionStatus(
        id,
        status,
        petsitterId ? { petsitterId } : undefined,
      )
      if (error) return error
      if (mission) {
        applyLocal(mission)
        return null
      }
      return status === 'accepted'
        ? 'Cette mission a déjà été acceptée par un autre pet-sitter.'
        : 'Mise à jour de la mission impossible.'
    }

    const target = missions.find(m => m.id === id)
    if (status === 'accepted') {
      if (target?.status !== 'pending' || target.petsitterId) {
        return 'Cette mission a déjà été acceptée par un autre pet-sitter.'
      }
    }

    setMissions(prev => prev.map(m => {
      if (m.id !== id) return m
      const next = { ...m, status }
      if (status === 'accepted' && currentUser?.role === 'petsitter') {
        next.petsitterId = currentUser.id
      }
      return next
    }))
    return null
  }, [currentUser, petSitterProfile?.verified, missions])

  const deleteMission = useCallback(async (id: string): Promise<string | null> => {
    const mission = missions.find(m => m.id === id)
    if (!mission) return 'Mission introuvable'

    if (currentUser?.role === 'owner') {
      if (mission.ownerId !== currentUser.id) return 'Non autorisé'
      if (mission.status === 'accepted') {
        return 'Mission déjà acceptée par un pet-sitter — contactez l\'admin pour l\'annuler.'
      }
    } else if (currentUser?.role !== 'admin') {
      return 'Non autorisé'
    }

    if (supabaseMode) {
      const { error } = await db.deleteMission(id)
      if (error) return error
    }

    setMissions(prev => prev.filter(m => m.id !== id))
    return null
  }, [currentUser, missions])

  const cancelMission = useCallback(async (id: string): Promise<string | null> => {
    const mission = missions.find(m => m.id === id)
    if (!mission) return 'Mission introuvable'

    if (currentUser?.role === 'owner') {
      if (mission.ownerId !== currentUser.id) return 'Non autorisé'
    } else if (currentUser?.role !== 'admin') {
      return 'Non autorisé'
    }

    if (mission.status !== 'pending' && mission.status !== 'accepted') {
      return 'Cette mission ne peut plus être annulée.'
    }

    if (supabaseMode) {
      const { mission: updated, error } = await db.cancelMission(id)
      if (error) return error
      if (updated) {
        setMissions(prev => prev.map(m => m.id === id ? updated : m))
        if (currentUser?.role === 'owner') {
          addActivity('urgence', `Mission annulée pour ${mission.petName}`)
        }
        return null
      }
      return 'Annulation impossible.'
    }

    setMissions(prev => prev.map(m => (
      m.id === id ? { ...m, status: 'cancelled' as Mission['status'] } : m
    )))
    return null
  }, [currentUser, missions, addActivity])

  const deleteActivity = useCallback(async (id: string): Promise<string | null> => {
    const activity = activities.find(a => a.id === id)
    if (!activity) return 'Entrée introuvable'

    if (currentUser?.role === 'owner' && activity.ownerId !== currentUser.id) {
      return 'Non autorisé'
    }
    if (currentUser?.role !== 'owner' && currentUser?.role !== 'admin') {
      return 'Non autorisé'
    }

    if (supabaseMode) {
      const { error } = await db.deleteActivity(id)
      if (error) return error
    }

    setActivities(prev => prev.filter(a => a.id !== id))
    return null
  }, [currentUser, activities])

  const setPetsitterVerifiedAdmin = useCallback(async (userId: string, verified: boolean): Promise<string | null> => {
    if (supabaseMode) {
      const { profile, error } = await db.setPetsitterVerified(userId, verified)
      if (error) return error
      if (profile) {
        setAllPetsitterProfiles(prev => prev.map(p => p.userId === userId ? profile : p))
        if (currentUser?.id === userId) setPetSitterProfile(profile)
      }
      return null
    }

    setAllPetsitterProfiles(prev => prev.map(p => (p.userId === userId ? { ...p, verified } : p)))
    if (currentUser?.id === userId) {
      setPetSitterProfile(prev => (prev ? { ...prev, verified } : prev))
    }
    return null
  }, [currentUser?.id])

  const syncSubscriptionFromStripe = useCallback(async (data: Omit<Subscription, 'id' | 'ownerId'> & { ownerId?: string }) => {
    if (!currentUser) return
    const ownerId = data.ownerId || currentUser.id
    const payload = {
      ownerId,
      plan: data.plan,
      status: data.status,
      price: data.price,
      startDate: data.startDate,
      renewalDate: data.renewalDate,
      autoRenew: data.autoRenew,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
    }

    if (supabaseMode) {
      const { subscription: saved, error } = await db.upsertSubscription(payload)
      if (saved) {
        setSubscription(saved)
      } else if (error) {
        console.error('[Subscription]', error)
        setSubscription({ id: '', ...payload })
      }
      const { invoices: refreshed } = await db.fetchInvoicesByOwner(ownerId)
      setInvoices(refreshed)
    } else {
      setSubscription({ id: generateId('sub'), ...payload })
    }

    addActivity('subscription', `Abonnement ${data.plan === 'monthly' ? 'mensuel' : 'annuel'} activé via Stripe`)
  }, [currentUser, addActivity])

  const updateSubscription = useCallback((plan: OwnerSubscriptionPlan) => {
    syncSubscriptionFromStripe({
      plan,
      status: 'active',
      price: PLAN_PRICES[plan],
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 86400000).toISOString().split('T')[0],
      autoRenew: true,
    })
  }, [syncSubscriptionFromStripe])

  const cancelSubscription = useCallback(() => {
    setSubscription(prev => prev ? { ...prev, status: 'cancelled', autoRenew: false } : null)
    addActivity('subscription', 'Abonnement résilié')
  }, [addActivity])

  const updatePetSitterProfile = useCallback((updates: Partial<PetSitterProfile>) => {
    setPetSitterProfile(prev => (prev ? { ...prev, ...updates } : prev))
    if (supabaseMode && currentUser) {
      void db.patchPetsitterProfile(currentUser.id, updates).then(({ profile, error }) => {
        if (error) console.error('[petsitter profile]', error)
        if (profile) setPetSitterProfile(profile)
      })
      return
    }
  }, [currentUser])

  const updateOwnerProfile = useCallback(async (updates: db.OwnerProfilePatch): Promise<string | null> => {
    if (!currentUser) return 'Session expirée.'
    if (currentUser.role !== 'owner') return 'Réservé aux propriétaires.'

    if (supabaseMode) {
      const { user, error } = await db.patchProfile(currentUser.id, updates)
      if (error) return error
      if (user) setCurrentUser(user)
      return null
    }

    const updated = { ...currentUser, ...updates }
    setCurrentUser(updated)
    setRegisteredUsers(prev => prev.map(u => (u.id === currentUser.id ? { ...u, ...updates } : u)))
    return null
  }, [currentUser])

  const persistSiteSettings = useCallback((settings: SiteSettings) => {
    if (supabaseMode) db.updateSiteSettings(settings)
    setSiteSettings(settings)
  }, [])

  const updateSiteSettings = useCallback((updates: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const next: SiteSettings = {
        ...prev,
        ...updates,
        contact: updates.contact ? { ...prev.contact, ...updates.contact } : prev.contact,
        legal: updates.legal ? { ...prev.legal, ...updates.legal } : prev.legal,
        home: updates.home ? { ...prev.home, ...updates.home } : prev.home,
        footer: updates.footer ? { ...prev.footer, ...updates.footer } : prev.footer,
        maintenance: updates.maintenance ? { ...prev.maintenance, ...updates.maintenance } : prev.maintenance,
        testimonials: updates.testimonials ?? prev.testimonials,
      }
      if (supabaseMode) db.updateSiteSettings(next)
      return next
    })
  }, [])

  const resetSiteSettings = useCallback(() => {
    persistSiteSettings(defaultSiteSettings)
  }, [persistSiteSettings])

  const addTestimonial = useCallback((testimonial: Omit<SiteTestimonial, 'id'>) => {
    setSiteSettings(prev => {
      const next = { ...prev, testimonials: [...prev.testimonials, { ...testimonial, id: generateId('test') }] }
      if (supabaseMode) db.updateSiteSettings(next)
      return next
    })
  }, [])

  const updateTestimonial = useCallback((id: string, updates: Partial<SiteTestimonial>) => {
    setSiteSettings(prev => {
      const next = { ...prev, testimonials: prev.testimonials.map(t => t.id === id ? { ...t, ...updates } : t) }
      if (supabaseMode) db.updateSiteSettings(next)
      return next
    })
  }, [])

  const deleteTestimonial = useCallback((id: string) => {
    setSiteSettings(prev => {
      const next = { ...prev, testimonials: prev.testimonials.filter(t => t.id !== id) }
      if (supabaseMode) db.updateSiteSettings(next)
      return next
    })
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      currentUser, pets, referents, documents, subscription, invoices, allSubscriptions,
      missions, petSitterProfile, allPetsitterProfiles, activities, allUsers, registeredUsers, siteSettings,
      authLoading, isSupabaseMode: supabaseMode,
      login, logout, register, registerPetsitter, completePetsitterIdentity,
      exportUserData, deleteAccount, deleteUserAsAdmin, addPet, updatePet, deletePet,
      addReferent, updateReferent, deleteReferent, reorderReferents,
      addDocument, deleteDocument, declareEmergency, updateMissionStatus, deleteMission, cancelMission, deleteActivity,
      setPetsitterVerified: setPetsitterVerifiedAdmin,
      updateSubscription, syncSubscriptionFromStripe, cancelSubscription, updatePetSitterProfile, updateOwnerProfile, addActivity,
      updateSiteSettings, resetSiteSettings, addTestimonial, updateTestimonial, deleteTestimonial,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useOwnerPets() {
  const { pets, currentUser } = useApp()
  return pets.filter(p => p.ownerId === currentUser?.id)
}

export function useOwnerReferents() {
  const { referents, currentUser } = useApp()
  return referents.filter(r => r.ownerId === currentUser?.id).sort((a, b) => a.priority - b.priority)
}

export function useOwnerDocuments() {
  const { documents, currentUser } = useApp()
  return documents.filter(d => d.ownerId === currentUser?.id)
}

export function useOwnerActivities() {
  const { activities, currentUser } = useApp()
  return activities.filter(a => a.ownerId === currentUser?.id)
}

export function useOwnerMissions() {
  const { missions, currentUser } = useApp()
  return missions.filter(m => m.ownerId === currentUser?.id)
}

export function usePetByToken(token: string) {
  const { pets } = useApp()
  return pets.find(p => p.qrToken === token)
}

export function useHasActiveSubscription() {
  const { subscription, currentUser, invoices } = useApp()
  return isOwnerSubscriptionActive(subscription, currentUser?.id, invoices)
}

export function useHasPetsitterVip() {
  const { subscription, currentUser, invoices } = useApp()
  return isPetsitterVipActive(subscription, currentUser?.id, invoices)
}

export function usePetSitterMissions() {
  const { missions, currentUser } = useApp()
  const uid = currentUser?.id
  return missions.filter(
    m => m.petsitterId === uid || (m.status === 'pending' && !m.petsitterId),
  )
}
