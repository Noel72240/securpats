import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Dog, Pill, AlertTriangle, Utensils, Stethoscope, QrCode } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { calculateAge } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'

export default function PetDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { pets } = useApp()
  const pet = pets.find(p => p.id === id)

  if (!pet) {
    return (
      <DashboardLayout variant="owner" title="Animal introuvable">
        <p className="text-slate-600">Cet animal n'existe pas.</p>
        <Link to="/app/animaux"><Button variant="outline" className="mt-4" icon={ArrowLeft}>{t('commonApp.back')}</Button></Link>
      </DashboardLayout>
    )
  }

  const sections = [
    { icon: Pill, title: 'Traitements', content: pet.treatments },
    { icon: AlertTriangle, title: 'Allergies', content: pet.allergies },
    { icon: Utensils, title: 'Alimentation', content: pet.diet },
    { icon: Stethoscope, title: 'Consignes particulières', content: pet.specialInstructions },
  ]

  return (
    <DashboardLayout variant="owner" title={pet.name}>
      <div className="space-y-6">
        <Link to="/app/animaux" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft className="w-4 h-4" /> {t('commonApp.back')}
        </Link>

        <Card padding="lg">
          <div className="flex flex-col sm:flex-row gap-6">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="w-32 h-32 rounded-2xl object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-brand-50 flex items-center justify-center">
                <Dog className="w-16 h-16 text-brand-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{pet.name}</h2>
                <Badge>{pet.sex}</Badge>
              </div>
              <p className="text-slate-600">{pet.species} — {pet.breed}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                <div><span className="text-slate-400">Âge</span><p className="font-medium">{calculateAge(pet.birthDate)}</p></div>
                <div><span className="text-slate-400">Poids</span><p className="font-medium">{pet.weight} kg</p></div>
                <div><span className="text-slate-400">Couleur</span><p className="font-medium">{pet.color}</p></div>
                <div><span className="text-slate-400">N° ID</span><p className="font-medium text-xs">{pet.identificationNumber}</p></div>
              </div>
            </div>
            <Link to="/app/qr-code">
              <Button variant="outline" icon={QrCode}>QR Code</Button>
            </Link>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <Card key={i}>
              <div className="flex items-center gap-2 mb-3">
                <s.icon className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{s.title}</h3>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{s.content || t('commonApp.notProvided')}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-brand-600" /> Vétérinaire référent
          </h3>
          <p className="font-medium text-slate-900">{pet.vetName}</p>
          <p className="text-sm text-slate-600">{pet.vetPhone}</p>
          <p className="text-sm text-slate-600">{pet.vetAddress}</p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
