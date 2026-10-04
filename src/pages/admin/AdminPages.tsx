import { useMemo, useState } from 'react'
import { CheckCircle, Eye, Trash2, XCircle, AlertTriangle, Dog, KeyRound, Copy, Search } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge, Modal } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { formatDate, formatHumanAge, calculateAge } from '@/lib/utils'
import { adminStats } from '@/lib/mock/data'
import { buildMonthlyRevenue } from '@/lib/admin/analytics'
import { getPetsitterDocSignedUrl } from '@/lib/supabase/uploads'
import { subscriptionPlanLabel, subscriptionPlanVariant, userRoleLabel } from '@/lib/admin/plan-labels'
import { adminResetUserPassword } from '@/lib/auth/password-reset'
import { departmentLabel } from '@/lib/geo/french-departments'
import {
  ANIMAL_OPTIONS,
  AVAILABILITY_OPTIONS,
  DOG_SIZE_OPTIONS,
  EMERGENCY_DELAY_OPTIONS,
  ENGAGEMENT_OPTIONS,
  HOUSING_OPTIONS,
  optionLabel,
  optionLabels,
  yesNoText,
} from '@/lib/caregiver/form'
import type { CaregiverProfile, User, Pet } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="text-slate-900 mt-0.5 whitespace-pre-line">{value || '—'}</dd>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </section>
  )
}

function kindLabel(kind?: string, role?: string) {
  if (kind === 'both') return 'Bénévole & famille d’accueil'
  if (kind === 'volunteer' || role === 'volunteer') return 'Bénévole'
  if (kind === 'foster_family' || role === 'foster_family') return 'Famille d’accueil'
  return userRoleLabel(role || 'owner')
}

function caregiverFullAddress(profile: CaregiverProfile | null | undefined, fallback?: string) {
  if (!profile) return fallback || '—'
  const street = profile.address?.trim() || ''
  const cityLine = [profile.postalCode, profile.city].filter(Boolean).join(' ').trim()
  if (street && cityLine) {
    // évite de répéter si l’adresse contient déjà le code postal / la ville
    const city = profile.city?.trim()
    if (
      (profile.postalCode && street.includes(profile.postalCode))
      || (city && street.toLowerCase().includes(city.toLowerCase()))
    ) {
      return street
    }
    return `${street}, ${cityLine}`
  }
  return street || cityLine || fallback || '—'
}

function CaregiverAdminFiche({
  user,
  profile,
  onOpenDoc,
}: {
  user: User
  profile: CaregiverProfile | null | undefined
  onOpenDoc: (path?: string) => void
}) {
  const q = profile?.questionnaire
  const animals = q?.acceptedAnimals?.length
    ? [
        optionLabels(ANIMAL_OPTIONS, q.acceptedAnimals),
        q.acceptedAnimalsOther?.trim() || '',
      ].filter(Boolean).join(' — ')
    : '—'

  return (
    <div className="space-y-1 text-sm max-h-[75vh] overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Badge variant={user.role === 'volunteer' ? 'warning' : 'success'}>
          {kindLabel(profile?.kind, user.role)}
        </Badge>
        <Badge variant={profile?.verified ? 'success' : 'warning'}>
          {profile?.verified ? 'Compte validé' : 'En attente de validation'}
        </Badge>
        {q?.hasAcaced === true && <Badge variant="info">ACACED</Badge>}
        {q?.hasAcaced === false && <span className="text-xs text-slate-500">Sans ACACED</span>}
      </div>

      <DetailSection title="Identité & contact">
        <DetailField label="Nom" value={`${user.firstName} ${user.lastName}`} />
        <DetailField label="Email" value={profile?.email || user.email} />
        <DetailField label="Téléphone" value={profile?.phone || user.phone} />
        <DetailField label="Date de naissance" value={profile?.birthDate ? formatDate(profile.birthDate) : '—'} />
        <DetailField label="Adresse" value={caregiverFullAddress(profile, user.address)} />
        <DetailField label="Département" value={departmentLabel(profile?.departmentCode)} />
        <DetailField label="Inscription" value={formatDate(user.createdAt)} />
      </DetailSection>

      <DetailSection title="Engagement & zone">
        <DetailField
          label="Type d’engagement"
          value={optionLabels(ENGAGEMENT_OPTIONS, profile?.engagementTypes)}
        />
        <DetailField
          label="Rayon d’intervention"
          value={profile?.interventionRadiusKm ? `${profile.interventionRadiusKm} km` : (profile?.serviceArea || '—')}
        />
        <DetailField label="Peut se déplacer" value={yesNoText(profile?.canTravel)} />
        <DetailField label="Véhicule personnel" value={yesNoText(profile?.hasVehicle)} />
      </DetailSection>

      <DetailSection title="Animaux acceptés">
        <DetailField label="Espèces" value={animals} />
        <DetailField label="Nombre max." value={q?.maxAnimals || '—'} />
        <DetailField label="Taille de chien" value={optionLabel(DOG_SIZE_OPTIONS, q?.maxDogSize)} />
        <DetailField label="Mâles" value={yesNoText(q?.acceptMales)} />
        <DetailField label="Femelles" value={yesNoText(q?.acceptFemales)} />
        <DetailField label="Stérilisés uniquement" value={yesNoText(q?.sterilizedOnly)} />
        <DetailField label="Chiots / chatons" value={yesNoText(q?.acceptPuppiesKittens)} />
        <DetailField label="Animaux âgés" value={yesNoText(q?.acceptSenior)} />
        <DetailField label="Malades" value={yesNoText(q?.acceptSick)} />
        <DetailField label="Traitements médicaux" value={yesNoText(q?.acceptMedicalTreatments)} />
        <DetailField label="Handicapés" value={yesNoText(q?.acceptDisabled)} />
        <DetailField label="Catégorisés" value={yesNoText(q?.acceptCategorized)} />
        <DetailField label="Non sociables" value={yesNoText(q?.acceptUnsociable)} />
        <DetailField label="Fugueurs" value={yesNoText(q?.acceptRunaways)} />
      </DetailSection>

      <DetailSection title="Logement">
        <DetailField label="Type" value={optionLabel(HOUSING_OPTIONS, q?.housingType)} />
        <DetailField label="Jardin clôturé" value={yesNoText(q?.gardenFenced)} />
        <DetailField label="Escaliers" value={yesNoText(q?.hasStairs)} />
        <DetailField label="Accès intérieur" value={yesNoText(q?.animalsIndoorAccess)} />
        <DetailField label="Animaux déjà au foyer" value={yesNoText(q?.hasOwnAnimals)} />
      </DetailSection>

      <DetailSection title="Expérience">
        <DetailField label="ACACED" value={yesNoText(q?.hasAcaced)} />
        <DetailField label="A déjà gardé des animaux" value={yesNoText(q?.hasKeptAnimals)} />
        <DetailField label="Autres formations" value={q?.training || '—'} />
        <DetailField label="Profession animale" value={q?.animalRelatedJob || '—'} />
        <DetailField label="Association" value={q?.animalAssociation || '—'} />
      </DetailSection>

      <DetailSection title="Disponibilités & urgences">
        <DetailField label="Disponibilités" value={optionLabels(AVAILABILITY_OPTIONS, q?.availabilityTypes?.length ? q.availabilityTypes : profile?.availableDays)} />
        <DetailField label="Urgences" value={yesNoText(q?.emergencyAvailable)} />
        <DetailField label="Délai moyen" value={optionLabel(EMERGENCY_DELAY_OPTIONS, q?.emergencyDelay)} />
      </DetailSection>

      <DetailSection title="Présentation">
        <div className="sm:col-span-2">
          <DetailField label="Parlez-nous de vous" value={profile?.aboutMe || profile?.bio || '—'} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Motivation" value={profile?.motivation || '—'} />
        </div>
        <div className="sm:col-span-2">
          <DetailField label="Informations importantes" value={profile?.importantNotes || '—'} />
        </div>
      </DetailSection>

      <section className="space-y-3 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Documents</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.idDocument ? (
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(profile.idDocument)}>Pièce ID</Button>
          ) : (
            <span className="text-xs text-amber-700 self-center">ID manquant</span>
          )}
          {profile?.proofOfAddress ? (
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(profile.proofOfAddress)}>Domicile</Button>
          ) : (
            <span className="text-xs text-amber-700 self-center">Domicile manquant</span>
          )}
          {profile?.criminalRecord ? (
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(profile.criminalRecord)}>Casier</Button>
          ) : (
            <span className="text-xs text-slate-400 self-center">Casier non fourni</span>
          )}
          {profile?.insurance ? (
            <Button variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(profile.insurance)}>Assurance RC</Button>
          ) : null}
          {(profile?.housingPhotos || []).map((p, i) => (
            <Button key={p} variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(p)}>Logement {i + 1}</Button>
          ))}
          {(profile?.outdoorPhotos || []).map((p, i) => (
            <Button key={p} variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(p)}>Extérieur {i + 1}</Button>
          ))}
          {(profile?.ownAnimalsPhotos || []).map((p, i) => (
            <Button key={p} variant="ghost" size="sm" icon={Eye} onClick={() => onOpenDoc(p)}>Animaux {i + 1}</Button>
          ))}
        </div>
      </section>
    </div>
  )
}

function PetDetailModal({
  pet,
  owner,
  onClose,
}: {
  pet: Pet | null
  owner: User | undefined
  onClose: () => void
}) {
  if (!pet) return null
  return (
    <Modal open={!!pet} onClose={onClose} title={`Fiche — ${pet.name}`}>
      <div className="space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex gap-4 items-start">
          {pet.photo ? (
            <img src={pet.photo} alt={pet.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Dog className="w-10 h-10 text-brand-400" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-slate-900">{pet.name}</p>
            <p className="text-slate-600">{pet.species} — {pet.breed}</p>
            <p className="text-slate-500 mt-1">{pet.sex}</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4">
          <DetailField label="Date de naissance" value={pet.birthDate ? formatDate(pet.birthDate) : undefined} />
          <DetailField label="Âge" value={pet.birthDate ? calculateAge(pet.birthDate) : undefined} />
          <DetailField label="Poids" value={pet.weight ? `${pet.weight} kg` : undefined} />
          <DetailField label="Couleur" value={pet.color} />
          <DetailField label="N° identification" value={pet.identificationNumber} />
          <DetailField label="Inscrit le" value={formatDate(pet.createdAt)} />
        </dl>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-semibold text-slate-900 mb-3">Santé & soins</h4>
          <dl className="space-y-3">
            <DetailField label="Traitements" value={pet.treatments} />
            <DetailField label="Allergies" value={pet.allergies} />
            <DetailField label="Alimentation" value={pet.diet} />
            <DetailField label="Consignes particulières" value={pet.specialInstructions} />
          </dl>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-semibold text-slate-900 mb-3">Vétérinaire référent</h4>
          <dl className="space-y-3">
            <DetailField label="Nom" value={pet.vetName} />
            <DetailField label="Téléphone" value={pet.vetPhone} />
            <DetailField label="Adresse" value={pet.vetAddress} />
          </dl>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-semibold text-slate-900 mb-3">Propriétaire</h4>
          <dl className="space-y-3">
            <DetailField label="Nom" value={owner ? `${owner.firstName} ${owner.lastName}` : undefined} />
            <DetailField label="Email" value={owner?.email} />
            <DetailField label="Téléphone" value={owner?.phone} />
          </dl>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <DetailField label="QR Token" value={<span className="font-mono text-xs break-all">{pet.qrToken}</span>} />
        </div>
      </div>
    </Modal>
  )
}

function OwnerIdentityModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  if (!user) return null
  return (
    <Modal open={!!user} onClose={onClose} title="Fiche identité">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-slate-500 font-medium">Nom complet</dt>
          <dd className="text-slate-900 font-semibold mt-0.5">{user.firstName} {user.lastName}</dd>
        </div>
        <div>
          <dt className="text-slate-500 font-medium">Email</dt>
          <dd className="text-slate-900 mt-0.5">{user.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500 font-medium">Téléphone</dt>
          <dd className="text-slate-900 mt-0.5">{user.phone || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500 font-medium">Adresse</dt>
          <dd className="text-slate-900 mt-0.5 whitespace-pre-line">{user.address || '—'}</dd>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-slate-500 font-medium">Date de naissance</dt>
            <dd className="text-slate-900 mt-0.5">{user.birthDate ? formatDate(user.birthDate) : '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Âge</dt>
            <dd className="text-slate-900 mt-0.5">{formatHumanAge(user.birthDate)}</dd>
          </div>
        </div>
        {user.role === 'owner' && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
            <p className="font-medium text-slate-800">Documents KYC</p>
            <p className={user.idDocument ? 'text-teal-700' : 'text-amber-700'}>
              {user.idDocument ? '✓' : '○'} Pièce d’identité {user.idDocument ? 'reçue' : 'manquante'}
            </p>
            <p className={user.proofOfAddress ? 'text-teal-700' : 'text-amber-700'}>
              {user.proofOfAddress ? '✓' : '○'} Justificatif de domicile {user.proofOfAddress ? 'reçu' : 'manquant'}
            </p>
            <p className={user.identityVerified ? 'text-teal-700' : 'text-amber-700'}>
              {user.identityVerified ? '✓ Compte validé' : '○ En attente de validation admin'}
            </p>
          </div>
        )}
      </dl>
    </Modal>
  )
}

function AdminTablePage({ title, variant, children }: { title: string; variant: 'admin'; children: React.ReactNode }) {
  return (
    <DashboardLayout variant={variant} title={title}>
      <Card>{children}</Card>
    </DashboardLayout>
  )
}

export function AdminUsersPage() {
  const { allUsers, deleteUserAsAdmin, currentUser, setOwnerIdentityVerified, isSupabaseMode } = useApp()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionOk, setActionOk] = useState<string | null>(null)
  const [identityUser, setIdentityUser] = useState<User | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [resetBusy, setResetBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'petsitter' | 'foster_family' | 'volunteer'>('all')

  const roleCounts = useMemo(() => ({
    owner: allUsers.filter(u => u.role === 'owner').length,
    petsitter: allUsers.filter(u => u.role === 'petsitter').length,
    foster_family: allUsers.filter(u => u.role === 'foster_family').length,
    volunteer: allUsers.filter(u => u.role === 'volunteer').length,
  }), [allUsers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allUsers.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!q) return true
      const hay = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase()
      return hay.includes(q)
    })
  }, [allUsers, query, roleFilter])

  const openDoc = async (path?: string) => {
    if (!path) return
    if (!isSupabaseMode) {
      setActionError('Consultation du document disponible uniquement avec Supabase.')
      return
    }
    const { url, error } = await getPetsitterDocSignedUrl(path)
    if (error || !url) {
      setActionError(error || 'Impossible d’ouvrir le document.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const toggleOwnerVerified = async (user: User, verified: boolean) => {
    if (verified && (!user.idDocument || !user.proofOfAddress)) {
      setActionError('Pièce d’identité et justificatif de domicile requis avant validation.')
      return
    }
    setBusyId(user.id)
    setActionError(null)
    setActionOk(null)
    const err = await setOwnerIdentityVerified(user.id, verified)
    if (err) setActionError(err)
    else setActionOk(verified ? 'Propriétaire validé — accès autorisé' : 'Validation révoquée')
    setBusyId(null)
  }

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setActionOk(`${label} copié`)
      setActionError(null)
    } catch {
      setActionError(`Impossible de copier ${label.toLowerCase()}`)
    }
  }

  const handleDelete = async (user: { id: string; firstName: string; lastName: string; email: string; role: string }) => {
    const label = `${user.firstName} ${user.lastName} (${user.email})`
    const confirmed = window.confirm(
      `Supprimer définitivement le compte ${label} ?\n\nCette action est irréversible (profil, animaux, abonnements, missions liées).`,
    )
    if (!confirmed) return

    setBusyId(user.id)
    setActionError(null)
    setActionOk(null)
    const err = await deleteUserAsAdmin(user.id)
    if (err) setActionError(err)
    else setActionOk('Compte supprimé')
    setBusyId(null)
  }

  const handleResetPassword = async () => {
    if (!resetUser) return
    const confirmed = window.confirm(
      `Définir un nouveau mot de passe temporaire pour ${resetUser.firstName} ${resetUser.lastName} (${resetUser.email}) ?\n\nL’ancien mot de passe ne peut pas être récupéré (il est chiffré).`,
    )
    if (!confirmed) return

    setResetBusy(true)
    setActionError(null)
    setActionOk(null)
    const result = await adminResetUserPassword(resetUser.id)
    setResetBusy(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
    setTempPassword(result.temporaryPassword || null)
    setActionOk(`Nouveau mot de passe généré pour ${result.email}`)
  }

  return (
    <AdminTablePage title="Gestion utilisateurs" variant="admin">
      <div className="px-4 pt-4 pb-2 space-y-3">
        <p className="text-sm text-slate-600">
          Les emails sont visibles ici (admin uniquement). Les mots de passe ne sont <strong>jamais récupérables</strong> (chiffrés) :
          vous pouvez en définir un temporaire pour un propriétaire, pet-sitter, famille d’accueil ou bénévole.
        </p>
        <p className="text-xs text-slate-500">
          En base : {roleCounts.owner} propriétaire(s) · {roleCounts.petsitter} pet-sitter(s) ·{' '}
          {roleCounts.foster_family} famille(s) d’accueil · {roleCounts.volunteer} bénévole(s)
        </p>
        {(roleCounts.owner === 0 && roleCounts.petsitter === 0) && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            Aucun propriétaire / pet-sitter trouvé. S’ils existaient avant, ils ont peut‑être été supprimés
            (vérifiez aussi Authentication → Users dans Supabase). Filtrez par rôle ou rechargez la page.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher nom ou email…"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="all">Tous les rôles</option>
            <option value="owner">Propriétaires</option>
            <option value="petsitter">Pet-sitters</option>
            <option value="foster_family">Familles d’accueil</option>
            <option value="volunteer">Bénévoles</option>
          </select>
        </div>
      </div>
      {actionError && (
        <p className="text-sm text-red-600 px-4 pb-2">{actionError}</p>
      )}
      {actionOk && (
        <p className="text-sm text-brand-700 px-4 pb-2">{actionOk}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Nom</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Rôle</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">2FA</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Inscription</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="break-all">{u.email}</span>
                    <button
                      type="button"
                      title="Copier l’email"
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      onClick={() => void copyText(u.email, 'Email')}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={
                    u.role === 'admin' ? 'danger'
                      : u.role === 'petsitter' ? 'info'
                        : u.role === 'volunteer' ? 'warning'
                          : 'success'
                  }>
                    {userRoleLabel(u.role)}
                  </Badge>
                </td>
                <td className="py-3 px-4">{u.twoFactorEnabled ? '✓' : '—'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {(u.role === 'owner' || u.role === 'foster_family' || u.role === 'volunteer') && (
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => setIdentityUser(u)}>
                        Fiche
                      </Button>
                    )}
                    {u.role === 'owner' && (
                      <>
                        {u.idDocument ? (
                          <Button variant="ghost" size="sm" icon={Eye} onClick={() => void openDoc(u.idDocument)}>
                            ID
                          </Button>
                        ) : (
                          <span className="text-xs text-amber-700 self-center">ID manquant</span>
                        )}
                        {u.proofOfAddress ? (
                          <Button variant="ghost" size="sm" icon={Eye} onClick={() => void openDoc(u.proofOfAddress)}>
                            Dom.
                          </Button>
                        ) : (
                          <span className="text-xs text-amber-700 self-center">Dom. manquant</span>
                        )}
                        {!u.identityVerified ? (
                          <Button
                            size="sm"
                            icon={CheckCircle}
                            disabled={busyId === u.id || !u.idDocument || !u.proofOfAddress}
                            onClick={() => void toggleOwnerVerified(u, true)}
                          >
                            Valider
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={XCircle}
                            disabled={busyId === u.id}
                            onClick={() => void toggleOwnerVerified(u, false)}
                          >
                            Révoquer
                          </Button>
                        )}
                      </>
                    )}
                    {(u.role === 'owner' || u.role === 'petsitter' || u.role === 'foster_family' || u.role === 'volunteer') && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={KeyRound}
                        onClick={() => {
                          setResetUser(u)
                          setTempPassword(null)
                        }}
                      >
                        Mot de passe
                      </Button>
                    )}
                    {u.role === 'admin' || u.id === currentUser?.id ? (
                      u.role !== 'owner' && u.role !== 'petsitter' && u.role !== 'foster_family' && u.role !== 'volunteer' && (
                        <span className="text-slate-400 text-xs">—</span>
                      )
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        disabled={busyId === u.id}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                        onClick={() => void handleDelete(u)}
                      >
                        {busyId === u.id ? '…' : 'Supprimer'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OwnerIdentityModal user={identityUser} onClose={() => setIdentityUser(null)} />

      <Modal
        open={Boolean(resetUser)}
        onClose={() => {
          if (resetBusy) return
          setResetUser(null)
          setTempPassword(null)
        }}
        title="Réinitialiser le mot de passe"
      >
        {resetUser && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Compte : <strong>{resetUser.firstName} {resetUser.lastName}</strong>
              <br />
              Email : <strong>{resetUser.email}</strong> ({userRoleLabel(resetUser.role)})
            </p>
            <p className="text-xs text-slate-500">
              Impossible d’afficher l’ancien mot de passe. Un mot de passe temporaire sera généré ;
              communiquez-le au client de façon sécurisée, puis demandez-lui de le changer.
            </p>

            {tempPassword ? (
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-brand-900">Mot de passe temporaire</p>
                <code className="block text-lg font-mono tracking-wide text-slate-900 break-all">{tempPassword}</code>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Copy}
                  onClick={() => void copyText(tempPassword, 'Mot de passe')}
                >
                  Copier
                </Button>
              </div>
            ) : (
              <Button
                icon={KeyRound}
                loading={resetBusy}
                onClick={() => void handleResetPassword()}
              >
                Générer un nouveau mot de passe
              </Button>
            )}
          </div>
        )}
      </Modal>
    </AdminTablePage>
  )
}

export function AdminPetsPage() {
  const { pets, allUsers } = useApp()
  const [detailPet, setDetailPet] = useState<Pet | null>(null)
  const detailOwner = detailPet ? allUsers.find(u => u.id === detailPet.ownerId) : undefined

  return (
    <AdminTablePage title="Gestion animaux" variant="admin">
      <p className="text-sm text-slate-600 px-4 pt-4 pb-2">
        Consultez la fiche complète de chaque animal (santé, vétérinaire, propriétaire).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Animal</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Espèce</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Propriétaire</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">QR Token</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-slate-500">Aucun animal enregistré.</td>
              </tr>
            ) : pets.map(p => {
              const owner = allUsers.find(u => u.id === p.ownerId)
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.species} — {p.breed}</td>
                  <td className="py-3 px-4">{owner ? `${owner.firstName} ${owner.lastName}` : '—'}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">{p.qrToken}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setDetailPet(p)}>
                      Détails
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <PetDetailModal pet={detailPet} owner={detailOwner} onClose={() => setDetailPet(null)} />
    </AdminTablePage>
  )
}

export function AdminReferentsPage() {
  const { referents, allUsers } = useApp()
  return (
    <AdminTablePage title="Gestion référents" variant="admin">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Nom</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Contact</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Priorité</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Propriétaire</th>
          </tr></thead>
          <tbody>
            {referents.map(r => {
              const owner = allUsers.find(u => u.id === r.ownerId)
              return (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{r.firstName} {r.lastName}</td>
                  <td className="py-3 px-4 text-slate-600">{r.phone} — {r.email}</td>
                  <td className="py-3 px-4"><Badge>Réf. {r.priority}</Badge></td>
                  <td className="py-3 px-4">{owner ? `${owner.firstName} ${owner.lastName}` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

export function AdminPetSittersPage() {
  const { allUsers, allPetsitterProfiles, setPetsitterVerified, isSupabaseMode } = useApp()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const sitters = allUsers.filter(u => u.role === 'petsitter')

  const profileFor = (userId: string) => allPetsitterProfiles.find(p => p.userId === userId)

  const openDoc = async (path?: string) => {
    if (!path) return
    if (!isSupabaseMode) {
      setActionError('Consultation du document disponible uniquement avec Supabase.')
      return
    }
    const { url, error } = await getPetsitterDocSignedUrl(path)
    if (error || !url) {
      setActionError(error || 'Impossible d\'ouvrir le document.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const toggleVerified = async (userId: string, verified: boolean) => {
    const profile = profileFor(userId)
    if (verified && (!profile?.idDocument || !profile?.proofOfAddress)) {
      setActionError('Pièce d’identité et justificatif de domicile requis avant validation.')
      return
    }
    setBusyId(userId)
    setActionError(null)
    const err = await setPetsitterVerified(userId, verified)
    if (err) setActionError(err)
    setBusyId(null)
  }

  return (
    <AdminTablePage title="Gestion Pet-Sitters" variant="admin">
      <p className="text-sm text-slate-600 px-4 pt-4 pb-2">
        Ouvrez la <strong>pièce d’identité</strong> et le <strong>justificatif de domicile</strong>, puis validez.
        L’extrait de casier est consultable s’il a été fourni (non bloquant).
        Sans validation ID + domicile, le pet-sitter n’a pas accès à l’espace.
      </p>
      {actionError && (
        <p className="text-sm text-red-600 px-4 pb-2">{actionError}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Nom</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Zone</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Pièce d&apos;identité</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Justificatif</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Casier</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">ACACED</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {sitters.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 px-4 text-center text-slate-500">Aucun pet-sitter inscrit.</td>
              </tr>
            ) : sitters.map(s => {
              const profile = profileFor(s.id)
              const verified = profile?.verified ?? false
              const canValidate = Boolean(profile?.idDocument && profile?.proofOfAddress)
              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="py-3 px-4 text-slate-600">{profile?.email || s.email}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {[departmentLabel(profile?.departmentCode), profile?.serviceArea].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.idDocument ? (
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => void openDoc(profile.idDocument)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-amber-700 text-xs">Manquant</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.proofOfAddress ? (
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => void openDoc(profile.proofOfAddress)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-amber-700 text-xs">Manquant</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.criminalRecord ? (
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => void openDoc(profile.criminalRecord)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-xs">Non fourni</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.hasAcaced === true ? (
                      <Badge variant="info">Oui</Badge>
                    ) : profile?.hasAcaced === false ? (
                      <span className="text-slate-500 text-xs">Non</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={verified ? 'success' : 'warning'}>
                      {verified ? 'Compte validé' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {!verified ? (
                        <Button
                          size="sm"
                          icon={CheckCircle}
                          disabled={busyId === s.id || !canValidate}
                          onClick={() => void toggleVerified(s.id, true)}
                        >
                          Valider le compte
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={XCircle}
                          disabled={busyId === s.id}
                          onClick={() => void toggleVerified(s.id, false)}
                        >
                          Révoquer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

export function AdminCaregiversPage() {
  const { allUsers, allCaregiverProfiles, setCaregiverVerified, deleteUserAsAdmin, isSupabaseMode } = useApp()
  const [kindFilter, setKindFilter] = useState<'all' | 'foster_family' | 'volunteer'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionOk, setActionOk] = useState<string | null>(null)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const caregivers = useMemo(() => {
    return allUsers.filter(u => {
      if (u.role !== 'foster_family' && u.role !== 'volunteer') return false
      if (kindFilter === 'all') return true
      return u.role === kindFilter
    })
  }, [allUsers, kindFilter])

  const profileFor = (userId: string) => allCaregiverProfiles.find(p => p.userId === userId)
  const detailUser = detailUserId ? allUsers.find(u => u.id === detailUserId) : null
  const detailProfile = detailUserId ? profileFor(detailUserId) : null

  const filterLabel =
    kindFilter === 'foster_family' ? 'familles d’accueil'
      : kindFilter === 'volunteer' ? 'bénévoles'
        : 'familles d’accueil et bénévoles'

  const openDoc = async (path?: string) => {
    if (!path) return
    if (!isSupabaseMode) {
      setActionError('Consultation du document disponible uniquement avec Supabase.')
      return
    }
    const { url, error } = await getPetsitterDocSignedUrl(path)
    if (error || !url) {
      setActionError(error || 'Impossible d’ouvrir le document.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const toggleVerified = async (userId: string, verified: boolean) => {
    const profile = profileFor(userId)
    if (verified && (!profile?.idDocument || !profile?.proofOfAddress)) {
      setActionError('Pièce d’identité et justificatif de domicile requis avant validation.')
      return
    }
    setBusyId(userId)
    setActionError(null)
    setActionOk(null)
    const err = await setCaregiverVerified(userId, verified)
    if (err) setActionError(err)
    else setActionOk(verified ? 'Compte validé — accès autorisé' : 'Validation révoquée')
    setBusyId(null)
  }

  const handleDelete = async (user: { id: string; firstName: string; lastName: string; email: string }) => {
    const label = `${user.firstName} ${user.lastName} (${user.email})`
    const confirmed = window.confirm(
      `Supprimer définitivement le compte ${label} ?\n\nCette action est irréversible.`,
    )
    if (!confirmed) return
    setBusyId(user.id)
    setActionError(null)
    setActionOk(null)
    const err = await deleteUserAsAdmin(user.id)
    if (err) setActionError(err)
    else {
      setActionOk('Compte supprimé')
      if (detailUserId === user.id) setDetailUserId(null)
    }
    setBusyId(null)
  }

  const handleDeleteAll = async () => {
    if (caregivers.length === 0) return
    const confirmed = window.confirm(
      `Supprimer définitivement les ${caregivers.length} compte(s) ${filterLabel} affichés ?\n\nCette action est irréversible.`,
    )
    if (!confirmed) return

    setBulkBusy(true)
    setActionError(null)
    setActionOk(null)
    let ok = 0
    const errors: string[] = []
    // Copie : la liste se met à jour au fil des suppressions
    const targets = [...caregivers]
    for (const u of targets) {
      const err = await deleteUserAsAdmin(u.id)
      if (err) errors.push(`${u.email}: ${err}`)
      else ok += 1
    }
    if (errors.length) {
      setActionError(`${ok} supprimé(s). Échecs : ${errors.slice(0, 3).join(' · ')}${errors.length > 3 ? '…' : ''}`)
    } else {
      setActionOk(`${ok} compte(s) supprimé(s).`)
      setDetailUserId(null)
    }
    setBulkBusy(false)
  }

  return (
    <AdminTablePage title="Familles d’accueil & bénévoles" variant="admin">
      <div className="px-4 pt-4 pb-2 space-y-3">
        <p className="text-sm text-slate-600">
          Ces comptes sont <strong>visibles uniquement par l’admin</strong>. Vérifiez pièce d’identité
          + justificatif de domicile avant de valider — sans cela, l’accès reste bloqué.
          L’extrait de casier est consultable s’il a été fourni (non bloquant).
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <select
            value={kindFilter}
            onChange={e => setKindFilter(e.target.value as typeof kindFilter)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            disabled={bulkBusy}
          >
            <option value="all">Tous</option>
            <option value="foster_family">Familles d’accueil</option>
            <option value="volunteer">Bénévoles</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            disabled={bulkBusy || caregivers.length === 0}
            className="!text-red-600 !border-red-200 hover:!bg-red-50"
            onClick={() => void handleDeleteAll()}
          >
            {bulkBusy ? 'Suppression…' : `Tout supprimer (${caregivers.length})`}
          </Button>
        </div>
      </div>
      {actionError && <p className="text-sm text-red-600 px-4 pb-2">{actionError}</p>}
      {actionOk && <p className="text-sm text-brand-700 px-4 pb-2">{actionOk}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Nom</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Pièce ID</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Domicile</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Casier</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">ACACED</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {caregivers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 px-4 text-center text-slate-500">
                  Aucun compte famille d’accueil / bénévole.
                </td>
              </tr>
            ) : caregivers.map(u => {
              const profile = profileFor(u.id)
              const verified = profile?.verified ?? false
              const canValidate = Boolean(profile?.idDocument && profile?.proofOfAddress)
              const rowBusy = bulkBusy || busyId === u.id
              const acaced = profile?.questionnaire?.hasAcaced
              return (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-4 text-slate-600">{profile?.email || u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'volunteer' ? 'warning' : 'success'}>
                      {profile?.kind === 'both'
                        ? 'Bénévole & famille'
                        : userRoleLabel(u.role)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {profile?.idDocument ? (
                      <Button variant="ghost" size="sm" icon={Eye} disabled={rowBusy} onClick={() => void openDoc(profile.idDocument)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-amber-700 text-xs">Manquant</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.proofOfAddress ? (
                      <Button variant="ghost" size="sm" icon={Eye} disabled={rowBusy} onClick={() => void openDoc(profile.proofOfAddress)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-amber-700 text-xs">Manquant</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile?.criminalRecord ? (
                      <Button variant="ghost" size="sm" icon={Eye} disabled={rowBusy} onClick={() => void openDoc(profile.criminalRecord)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-xs">Non fourni</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {acaced === true ? (
                      <Badge variant="info">Oui</Badge>
                    ) : acaced === false ? (
                      <span className="text-slate-500 text-xs">Non</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={verified ? 'success' : 'warning'}>
                      {verified ? 'Profil vérifié SécurPats' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" icon={Eye} disabled={rowBusy} onClick={() => setDetailUserId(u.id)}>
                        Fiche
                      </Button>
                      {!verified ? (
                        <Button
                          size="sm"
                          icon={CheckCircle}
                          disabled={rowBusy || !canValidate}
                          onClick={() => void toggleVerified(u.id, true)}
                        >
                          Valider
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={XCircle}
                          disabled={rowBusy}
                          onClick={() => void toggleVerified(u.id, false)}
                        >
                          Révoquer
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        disabled={rowBusy}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                        onClick={() => void handleDelete(u)}
                      >
                        {busyId === u.id ? '…' : 'Supprimer'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(detailUser)}
        onClose={() => setDetailUserId(null)}
        title={detailUser ? `Fiche — ${detailUser.firstName} ${detailUser.lastName}` : 'Fiche'}
      >
        {detailUser && (
          <div className="space-y-4">
            <CaregiverAdminFiche
              user={detailUser}
              profile={detailProfile}
              onOpenDoc={path => void openDoc(path)}
            />
            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                disabled={busyId === detailUser.id || bulkBusy}
                className="!text-red-600 !border-red-200 hover:!bg-red-50"
                onClick={() => void handleDelete(detailUser)}
              >
                Supprimer ce compte
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminTablePage>
  )
}

export function AdminDocumentsPage() {
  const { documents } = useApp()
  return (
    <AdminTablePage title="Gestion documents" variant="admin">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Document</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Catégorie</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Taille</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
          </tr></thead>
          <tbody>
            {documents.map(d => (
              <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{d.name}</td>
                <td className="py-3 px-4"><Badge>{d.category}</Badge></td>
                <td className="py-3 px-4 text-slate-600">{(d.fileSize / 1024).toFixed(0)} Ko</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(d.uploadedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

const missionStatusLabel: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  declined: 'Refusée',
  completed: 'Terminée',
  cancelled: 'Annulée',
}

export function AdminMissionsPage() {
  const { missions, deleteMission, allUsers } = useApp()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const pendingCount = missions.filter(m => m.status === 'pending').length
  const filtered = filter === 'all' ? missions : missions.filter(m => m.status === filter)

  const spamByOwner = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of missions.filter(x => x.status === 'pending')) {
      counts.set(m.ownerId, (counts.get(m.ownerId) ?? 0) + 1)
    }
    return [...counts.entries()].filter(([, n]) => n >= 3)
  }, [missions])

  const handleDelete = async (id: string, petName: string) => {
    if (!window.confirm(`Supprimer la mission « ${petName} » ? Action irréversible.`)) return
    setBusyId(id)
    setActionError(null)
    const err = await deleteMission(id)
    if (err) setActionError(err)
    setBusyId(null)
  }

  const deleteOwnerPending = async (ownerId: string, ownerName: string) => {
    const pending = missions.filter(m => m.ownerId === ownerId && m.status === 'pending')
    if (!window.confirm(`Supprimer les ${pending.length} missions en attente de ${ownerName} ?`)) return
    setBusyId(ownerId)
    setActionError(null)
    for (const m of pending) {
      const err = await deleteMission(m.id)
      if (err) {
        setActionError(err)
        break
      }
    }
    setBusyId(null)
  }

  return (
    <AdminTablePage title="Gestion missions" variant="admin">
      <div className="space-y-4 px-4 pt-4">
        <p className="text-sm text-slate-600">
          Modérez les demandes d&apos;urgence : supprimez le spam ou les doublons.
          {pendingCount > 0 && (
            <span className="font-medium text-amber-700"> {pendingCount} en attente.</span>
          )}
        </p>

        {spamByOwner.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
            <p className="font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Suspect spam (3+ urgences en attente)
            </p>
            <ul className="space-y-2">
              {spamByOwner.map(([ownerId, count]) => {
                const u = allUsers.find(x => x.id === ownerId)
                const name = u ? `${u.firstName} ${u.lastName}` : ownerId
                return (
                  <li key={ownerId} className="flex flex-wrap items-center justify-between gap-2">
                    <span>{name} — {count} missions en attente</span>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Trash2}
                      disabled={busyId === ownerId}
                      className="!text-red-600 !border-red-200"
                      onClick={() => void deleteOwnerPending(ownerId, name)}
                    >
                      Tout supprimer
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {actionError && <p className="text-sm text-red-600">{actionError}</p>}

        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'accepted'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Acceptées'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Animal</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Propriétaire</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">Aucune mission.</td>
              </tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{m.petName}</td>
                <td className="py-3 px-4"><Badge variant={m.type === 'urgence' ? 'danger' : 'info'}>{m.type}</Badge></td>
                <td className="py-3 px-4">
                  <Badge variant={m.status === 'pending' ? 'warning' : m.status === 'accepted' ? 'success' : 'default'}>
                    {missionStatusLabel[m.status] ?? m.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">{m.ownerName}</td>
                <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">{m.description || '—'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(m.createdAt)}</td>
                <td className="py-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    disabled={busyId === m.id}
                    className="!text-red-600 !border-red-200 hover:!bg-red-50"
                    onClick={() => void handleDelete(m.id, m.petName)}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

export function AdminSubscriptionsPage() {
  const { invoices, allSubscriptions, allUsers } = useApp()
  const paidCount = invoices.filter(i => i.status === 'paid').length
  const ownerSubs = allSubscriptions.filter(s => s.plan !== 'petsitter_vip')
  const petsitterSubs = allSubscriptions.filter(s => s.plan === 'petsitter_vip')

  const userFor = (userId: string) => allUsers.find(u => u.id === userId)

  return (
    <AdminTablePage title="Gestion abonnements" variant="admin">
      <div className="space-y-8 p-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{allSubscriptions.length}</p>
            <p className="text-sm text-slate-600">Abonnements en base</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{ownerSubs.length}</p>
            <p className="text-sm text-slate-600">Propriétaires</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-slate-900">{petsitterSubs.length}</p>
            <p className="text-sm text-slate-600">Pet-Sitters VIP</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Abonnements actifs et historique</h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Rôle</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Prix</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Renouvellement</th>
              </tr></thead>
              <tbody>
                {allSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-500">Aucun abonnement enregistré.</td>
                  </tr>
                ) : allSubscriptions.map(sub => {
                  const u = userFor(sub.ownerId)
                  return (
                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{u ? `${u.firstName} ${u.lastName}` : '—'}</p>
                        <p className="text-xs text-slate-500">{u?.email ?? sub.ownerId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={u?.role === 'petsitter' ? 'info' : 'success'}>
                          {u ? userRoleLabel(u.role) : '—'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={subscriptionPlanVariant(sub.plan)}>{subscriptionPlanLabel(sub.plan)}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{sub.price.toFixed(2)} €</td>
                      <td className="py-3 px-4">
                        <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>{sub.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(sub.renewalDate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-1">Factures Stripe</h3>
          <p className="text-sm text-slate-600 mb-3">{paidCount} paiement{paidCount > 1 ? 's' : ''} enregistré{paidCount > 1 ? 's' : ''}</p>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Montant</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Réf.</th>
              </tr></thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-500">Aucune facture.</td>
                  </tr>
                ) : invoices.map(inv => {
                  const u = userFor(inv.ownerId)
                  return (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{u ? `${u.firstName} ${u.lastName}` : '—'}</p>
                        <p className="text-xs text-slate-500">{u?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={subscriptionPlanVariant(inv.plan)}>{subscriptionPlanLabel(inv.plan)}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">{inv.amount.toFixed(2)} €</td>
                      <td className="py-3 px-4"><Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(inv.date)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{inv.stripeInvoiceId?.slice(0, 14) ?? inv.id.slice(0, 8)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminTablePage>
  )
}

export function AdminStatsPage() {
  const { invoices } = useApp()
  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(invoices), [invoices])
  const charts = [
    { title: 'Utilisateurs', key: 'users' as const, color: '#9333ea', data: adminStats.monthlyGrowth },
    { title: 'Animaux', key: 'pets' as const, color: '#059669', data: adminStats.monthlyGrowth },
    { title: 'Missions', key: 'missions' as const, color: '#2563eb', data: adminStats.monthlyGrowth },
    { title: 'Revenus (€)', key: 'revenue' as const, color: '#f59e0b', data: monthlyRevenue },
  ]

  return (
    <DashboardLayout variant="admin" title="Statistiques">
      <div className="grid lg:grid-cols-2 gap-6">
        {charts.map(chart => (
          <Card key={chart.key}>
            <h3 className="font-semibold text-slate-900 mb-4">{chart.title}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey={chart.key} fill={chart.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
