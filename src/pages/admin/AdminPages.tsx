import { useMemo, useState } from 'react'
import { CheckCircle, Eye, Trash2, XCircle, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { formatDate } from '@/lib/utils'
import { adminStats } from '@/lib/mock/data'
import { buildMonthlyRevenue } from '@/lib/admin/analytics'
import { getPetsitterDocSignedUrl } from '@/lib/supabase/uploads'
import { subscriptionPlanLabel, subscriptionPlanVariant, userRoleLabel } from '@/lib/admin/plan-labels'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function AdminTablePage({ title, variant, children }: { title: string; variant: 'admin'; children: React.ReactNode }) {
  return (
    <DashboardLayout variant={variant} title={title}>
      <Card>{children}</Card>
    </DashboardLayout>
  )
}

export function AdminUsersPage() {
  const { allUsers, deleteUserAsAdmin, currentUser } = useApp()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleDelete = async (user: { id: string; firstName: string; lastName: string; email: string; role: string }) => {
    const label = `${user.firstName} ${user.lastName} (${user.email})`
    const confirmed = window.confirm(
      `Supprimer définitivement le compte ${label} ?\n\nCette action est irréversible (profil, animaux, abonnements, missions liées).`,
    )
    if (!confirmed) return

    setBusyId(user.id)
    setActionError(null)
    const err = await deleteUserAsAdmin(user.id)
    if (err) setActionError(err)
    setBusyId(null)
  }

  return (
    <AdminTablePage title="Gestion utilisateurs" variant="admin">
      <p className="text-sm text-slate-600 px-4 pt-4 pb-2">
        Supprimez les comptes inactifs, doublons ou tests. Les comptes administrateur ne peuvent pas être supprimés ici.
      </p>
      {actionError && (
        <p className="text-sm text-red-600 px-4 pb-2">{actionError}</p>
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
            {allUsers.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4"><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'petsitter' ? 'info' : 'success'}>{userRoleLabel(u.role)}</Badge></td>
                <td className="py-3 px-4">{u.twoFactorEnabled ? '✓' : '—'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="py-3 px-4">
                  {u.role === 'admin' || u.id === currentUser?.id ? (
                    <span className="text-slate-400 text-xs">—</span>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

export function AdminPetsPage() {
  const { pets, allUsers } = useApp()
  return (
    <AdminTablePage title="Gestion animaux" variant="admin">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Animal</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Espèce</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Propriétaire</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">QR Token</th>
          </tr></thead>
          <tbody>
            {pets.map(p => {
              const owner = allUsers.find(u => u.id === p.ownerId)
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.species} — {p.breed}</td>
                  <td className="py-3 px-4">{owner ? `${owner.firstName} ${owner.lastName}` : '—'}</td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">{p.qrToken}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
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

  const openIdDocument = async (path?: string) => {
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
    setBusyId(userId)
    setActionError(null)
    const err = await setPetsitterVerified(userId, verified)
    if (err) setActionError(err)
    setBusyId(null)
  }

  return (
    <AdminTablePage title="Gestion Pet-Sitters" variant="admin">
      <p className="text-sm text-slate-600 px-4 pt-4 pb-2">
        Vérifiez la pièce d&apos;identité puis cliquez sur <strong>Valider le compte</strong>.
        Un pet-sitter non validé ne peut pas accepter de missions.
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
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {sitters.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-slate-500">Aucun pet-sitter inscrit.</td>
              </tr>
            ) : sitters.map(s => {
              const profile = profileFor(s.id)
              const verified = profile?.verified ?? false
              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="py-3 px-4 text-slate-600">{profile?.email || s.email}</td>
                  <td className="py-3 px-4 text-slate-600">{profile?.serviceArea || '—'}</td>
                  <td className="py-3 px-4">
                    {profile?.idDocument ? (
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => openIdDocument(profile.idDocument)}>
                        Voir
                      </Button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={verified ? 'success' : 'warning'}>
                      {verified ? 'Validé' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {!verified ? (
                        <Button
                          size="sm"
                          icon={CheckCircle}
                          disabled={busyId === s.id || !profile}
                          onClick={() => toggleVerified(s.id, true)}
                        >
                          Valider le compte
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={XCircle}
                          disabled={busyId === s.id}
                          onClick={() => toggleVerified(s.id, false)}
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
