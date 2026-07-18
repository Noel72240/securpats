import { Construction, Wrench } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { isMaintenanceBannerVisible } from '@/lib/maintenance'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'

export function MaintenanceBanner() {
  const { siteSettings } = useApp()
  const { t, locale } = useI18n()

  if (!isMaintenanceBannerVisible(siteSettings)) return null

  const { mode, message, blockPayments } = siteSettings.maintenance
  const isDev = mode === 'development'
  const Icon = isDev ? Construction : Wrench
  const title = t(isDev ? 'maintenance.devTitle' : 'maintenance.title')
  const displayMessage = locale === 'en' ? t('maintenance.message') : (message || t('maintenance.message'))

  return (
    <div
      role="status"
      className={cn(
        'no-print px-4 py-2.5 text-center text-sm font-medium',
        isDev
          ? 'bg-amber-500 text-amber-950'
          : 'bg-orange-600 text-white',
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
        <span className="inline-flex items-center gap-2 font-semibold">
          <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
          {title}
        </span>
        {displayMessage && (
          <span className={cn('opacity-90', isDev ? 'text-amber-900' : 'text-orange-50')}>
            — {displayMessage}
          </span>
        )}
        {blockPayments && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isDev ? 'bg-amber-600/30 text-amber-950' : 'bg-orange-700/50 text-orange-50',
          )}>
            {t('maintenance.paymentsSuspended')}
          </span>
        )}
      </div>
    </div>
  )
}
