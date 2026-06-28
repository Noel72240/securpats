import { CreditCard } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, EmptyState } from '@/components/ui/Card'
import { OwnerPrintableSheet } from '@/components/owner/OwnerPrintableSheet'
import { useApp } from '@/contexts/AppContext'

export default function EmergencyCardPage() {
  const { currentUser } = useApp()

  if (!currentUser || currentUser.role !== 'owner') {
    return null
  }

  return (
    <DashboardLayout variant="owner" title="Fiche imprimable">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-slate-600 mb-6 no-print">
          Votre QR code foyer est généré automatiquement. Imprimez cette fiche et conservez-la visible :
          elle regroupe votre nom, tous vos animaux et vos référents.
        </p>
        {!currentUser.qrToken ? (
          <Card>
            <EmptyState
              icon={CreditCard}
              title="QR code en cours de génération"
              description="Rechargez la page dans quelques instants."
            />
          </Card>
        ) : (
          <OwnerPrintableSheet />
        )}
      </div>
    </DashboardLayout>
  )
}
