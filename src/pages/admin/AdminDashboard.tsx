import { Link } from 'react-router-dom'
import { Users, Dog, Briefcase, CreditCard, Globe, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard, Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminStats } from '@/lib/mock/data'
import { useApp } from '@/contexts/AppContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
  const { allUsers, registeredUsers, pets, missions, invoices } = useApp()
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)

  return (
    <DashboardLayout variant="admin" title="Administration">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Back-office SécurPats</h2>
          <p className="text-slate-600">Vue d'ensemble de la plateforme.</p>
        </div>

        <Card className="bg-purple-50 border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Contenu du site public</p>
              <p className="text-sm text-slate-600">Modifier adresses, contacts, images et témoignages</p>
            </div>
          </div>
          <Link to="/admin/contenu-site">
            <Button size="sm" icon={ArrowRight}>Gérer le contenu</Button>
          </Link>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Utilisateurs" value={allUsers.length} color="purple" />
          <StatCard icon={Dog} label="Animaux" value={pets.length} color="brand" />
          <StatCard icon={Briefcase} label="Missions" value={missions.length} color="blue" />
          <StatCard icon={CreditCard} label="Revenus" value={`${totalRevenue.toFixed(2).replace('.', ',')} €`} color="accent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Croissance utilisateurs" />
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={adminStats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#9333ea" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader title="Revenus mensuels (simulés)" />
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={adminStats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <Card><p className="text-2xl font-bold text-slate-900">{registeredUsers.length}</p><p className="text-sm text-slate-500">Inscrits</p></Card>
          <Card><p className="text-2xl font-bold text-slate-900">{pets.length}</p><p className="text-sm text-slate-500">Animaux</p></Card>
          <Card><p className="text-2xl font-bold text-slate-900">{missions.length}</p><p className="text-sm text-slate-500">Missions</p></Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
