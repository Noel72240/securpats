import { useMemo, useState } from 'react'
import { CheckCircle, Eye, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, Badge } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { formatDate } from '@/lib/utils'
import { adminStats } from '@/lib/mock/data'
import { buildMonthlyRevenue } from '@/lib/admin/analytics'
import { getPetsitterDocSignedUrl } from '@/lib/supabase/uploads'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function AdminTablePage({ title, variant, children }: { title: string; variant: 'admin'; children: React.ReactNode }) {
  return (
    <DashboardLayout variant={variant} title={title}>
      <Card>{children}</Card>
    </DashboardLayout>
  )
}

export function AdminUsersPage() {
  const { allUsers } = useApp()
  return (
    <AdminTablePage title="Gestion utilisateurs" variant="admin">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Nom</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Rôle</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">2FA</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Inscription</th>
          </tr></thead>
          <tbody>
            {allUsers.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4"><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'petsitter' ? 'info' : 'success'}>{u.role}</Badge></td>
                <td className="py-3 px-4">{u.twoFactorEnabled ? '✓' : '—'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
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

export function AdminMissionsPage() {
  const { missions } = useApp()
  return (
    <AdminTablePage title="Gestion missions" variant="admin">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Animal</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Propriétaire</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
          </tr></thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{m.petName}</td>
                <td className="py-3 px-4"><Badge variant={m.type === 'urgence' ? 'danger' : 'info'}>{m.type}</Badge></td>
                <td className="py-3 px-4"><Badge variant={m.status === 'pending' ? 'warning' : m.status === 'accepted' ? 'success' : 'default'}>{m.status}</Badge></td>
                <td className="py-3 px-4">{m.ownerName}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(m.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTablePage>
  )
}

export function AdminSubscriptionsPage() {
  const { invoices } = useApp()
  const paidCount = invoices.filter(i => i.status === 'paid').length
  return (
    <AdminTablePage title="Gestion abonnements" variant="admin">
      <div className="mb-6 p-4 bg-purple-50 rounded-xl">
        <p className="font-semibold text-slate-900">Factures Stripe</p>
        <p className="text-sm text-slate-600">{paidCount} paiement{paidCount > 1 ? 's' : ''} enregistré{paidCount > 1 ? 's' : ''}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Facture</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Montant</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Plan</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
          </tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-xs">{inv.id}</td>
                <td className="py-3 px-4 font-medium">{inv.amount.toFixed(2)} €</td>
                <td className="py-3 px-4">{inv.plan}</td>
                <td className="py-3 px-4"><Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                <td className="py-3 px-4 text-slate-500">{formatDate(inv.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
