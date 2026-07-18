import { MessageSquare } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MessagingInbox } from '@/components/messaging/MessagingInbox'
import { useI18n } from '@/i18n/LanguageContext'

export default function PetSitterMessagesPage() {
  const { t } = useI18n()

  return (
    <DashboardLayout variant="petsitter" title={t('messaging.title')}>
      <div className="max-w-4xl space-y-4">
        <Card className="!p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Contacter l’administrateur</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Échangez avec le support SécurPats pour vos missions, votre profil ou votre abonnement VIP.
            </p>
          </div>
        </Card>
        <MessagingInbox mode="client" accent="blue" />
      </div>
    </DashboardLayout>
  )
}
