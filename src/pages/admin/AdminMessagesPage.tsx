import { MessageSquare } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MessagingInbox } from '@/components/messaging/MessagingInbox'

export default function AdminMessagesPage() {
  return (
    <DashboardLayout variant="admin" title="Messagerie">
      <div className="max-w-6xl space-y-4">
        <Card className="!p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Boîte de messagerie</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Répondez aux propriétaires et pet-sitters. Vous pouvez aussi ouvrir une conversation proactivement.
            </p>
          </div>
        </Card>
        <MessagingInbox mode="admin" accent="purple" />
      </div>
    </DashboardLayout>
  )
}
