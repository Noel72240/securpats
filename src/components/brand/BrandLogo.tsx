import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

/** Conservés pour compatibilité (cartes PDF, directives) — plus affichés dans l’UI. */
export const DEFAULT_LOGO_ICON = ''
export const DEFAULT_LOGO_FULL = ''
export const DEFAULT_LOGO_URL = ''
export const LOGO_ALT = "SécurPats — Protection animale d'urgence"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  to?: string
  /** icon = en-tête | full = pied de page (texte plus grand) */
  variant?: 'icon' | 'full'
  showText?: boolean
}

export function BrandLogo({
  className,
  to = '/',
  variant = 'icon',
  showText = true,
}: BrandLogoProps) {
  const { siteSettings } = useApp()
  const siteName = siteSettings.siteName || 'SécurPats'
  const isFull = variant === 'full'

  if (!showText) {
    return null
  }

  const content = isFull ? (
    <span className="block leading-tight">
      <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
        {siteName}
      </span>
      <span className="block text-sm text-slate-400 font-medium mt-1">
        Protection animale
      </span>
    </span>
  ) : (
    <span className="min-w-0 leading-tight">
      <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
        {siteName}
      </span>
      <span className="hidden sm:block text-xs sm:text-sm text-slate-500 font-medium">
        Protection animale
      </span>
    </span>
  )

  const wrapClass = cn('inline-flex items-center shrink-0', className)

  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label={LOGO_ALT}>
        {content}
      </Link>
    )
  }

  return <div className={wrapClass}>{content}</div>
}
