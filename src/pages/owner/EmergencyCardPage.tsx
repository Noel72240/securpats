import { CreditCard } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, EmptyState } from '@/components/ui/Card'
import { OwnerPrintableSheet } from '@/components/owner/OwnerPrintableSheet'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'

export default function EmergencyCardPage() {
  const { t } = useI18n()
  const { currentUser } = useApp()

  if (!currentUser || currentUser.role !== 'owner') {
    return null
  }

  return (
    <DashboardLayout variant="owner" title={t('ownerCard.title')}>
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-slate-600 mb-6 no-print">
          Carte format identité (85,6 × 54 mm) : votre nom, QR code foyer, animaux et référents.
          Imprimez-la puis plastifiez-la ou glissez-la dans votre portefeuille.
        </p>
        {!currentUser.qrToken ? (
          <Card>
            <EmptyState
              icon={CreditCard}
              title={t('ownerCard.generating')}
              description={t('ownerCard.reload')}
            />
          </Card>
        ) : (
          <OwnerPrintableSheet />
        )}
      </div>
    </DashboardLayout>
  )
}
