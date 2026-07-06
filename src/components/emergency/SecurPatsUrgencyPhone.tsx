import { Phone } from 'lucide-react'
import { SECURPATS_URGENCY_PHONE_DISPLAY, SECURPATS_URGENCY_PHONE_HREF } from '@/lib/brand/contact'

export function SecurPatsUrgencyPhone({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <a
        href={SECURPATS_URGENCY_PHONE_HREF}
        className="inline-flex items-center gap-1.5 text-brand-700 font-semibold hover:text-brand-800"
      >
        <Phone className="w-4 h-4 flex-shrink-0" />
        {SECURPATS_URGENCY_PHONE_DISPLAY}
      </a>
    )
  }

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-1">
        Assistance SécurPats
      </p>
      <a
        href={SECURPATS_URGENCY_PHONE_HREF}
        className="text-xl font-bold text-brand-800 inline-flex items-center justify-center gap-2 hover:text-brand-900"
      >
        <Phone className="w-5 h-5 flex-shrink-0" />
        {SECURPATS_URGENCY_PHONE_DISPLAY}
      </a>
    </div>
  )
}
