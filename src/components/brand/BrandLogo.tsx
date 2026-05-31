import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

export const DEFAULT_LOGO_ICON = '/logo-securpats-icon.png'
export const DEFAULT_LOGO_FULL = '/logo-securpats.png'
/** @deprecated use DEFAULT_LOGO_FULL */
export const DEFAULT_LOGO_URL = DEFAULT_LOGO_FULL
export const LOGO_ALT = "SécurPats — Protection animale d'urgence"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  to?: string
  /** icon = bouclier + nom (header) | full = logo horizontal complet (footer) */
  variant?: 'icon' | 'full'
  showText?: boolean
}

export function BrandLogo({
  className,
  imageClassName,
  to = '/',
  variant = 'icon',
  showText = true,
}: BrandLogoProps) {
  const { siteSettings } = useApp()
  const siteName = siteSettings.siteName || 'SécurPats'

  const isFull = variant === 'full'
  const src = isFull
    ? (siteSettings.logoUrl || DEFAULT_LOGO_FULL)
    : DEFAULT_LOGO_ICON

  const content = isFull ? (
    <img
      src={src}
      alt={LOGO_ALT}
      className={cn('h-20 sm:h-24 lg:h-28 w-auto max-w-[min(100%,420px)] object-contain object-left', imageClassName)}
    />
  ) : (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn(
          'h-16 w-16 sm:h-[4.25rem] sm:w-[4.25rem] lg:h-20 lg:w-20 object-contain shrink-0',
          imageClassName,
        )}
      />
      {showText && (
        <span className="min-w-0 leading-tight">
          <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            {siteName}
          </span>
          <span className="hidden sm:block text-xs sm:text-sm text-slate-500 font-medium">
            Protection animale
          </span>
        </span>
      )}
    </>
  )

  const wrapClass = cn(
    'inline-flex items-center shrink-0',
    !isFull && showText && 'gap-2.5 sm:gap-3',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label={LOGO_ALT}>
        {content}
      </Link>
    )
  }

  return <div className={wrapClass}>{content}</div>
}
