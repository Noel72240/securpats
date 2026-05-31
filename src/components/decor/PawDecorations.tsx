import { useLocation } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { cn } from '@/lib/utils'

type PawVariant = 'dog' | 'cat'

interface PawItem {
  top: string
  size: number
  rotate: number
  delay: number
}

/** Mobile — compact, bords écran */
const MOBILE_LEFT: PawItem[] = [
  { top: '12%', size: 22, rotate: -20, delay: 0 },
  { top: '35%', size: 18, rotate: 15, delay: 0.8 },
  { top: '58%', size: 24, rotate: -10, delay: 1.5 },
  { top: '80%', size: 20, rotate: 22, delay: 0.4 },
]

const MOBILE_RIGHT: PawItem[] = [
  { top: '18%', size: 20, rotate: 18, delay: 0.6 },
  { top: '42%', size: 24, rotate: -12, delay: 1.2 },
  { top: '65%', size: 18, rotate: 25, delay: 0.2 },
  { top: '88%', size: 22, rotate: -18, delay: 1.8 },
]

/** Desktop — plus de pattes, plus grandes */
const DESKTOP_LEFT: PawItem[] = [
  { top: '6%', size: 52, rotate: -25, delay: 0 },
  { top: '20%', size: 38, rotate: 18, delay: 1.2 },
  { top: '36%', size: 58, rotate: -12, delay: 0.5 },
  { top: '52%', size: 42, rotate: 28, delay: 1.8 },
  { top: '68%', size: 50, rotate: -18, delay: 0.3 },
  { top: '82%', size: 36, rotate: 14, delay: 2.1 },
  { top: '94%', size: 46, rotate: -8, delay: 1 },
]

const DESKTOP_RIGHT: PawItem[] = [
  { top: '10%', size: 44, rotate: 22, delay: 0.7 },
  { top: '24%', size: 56, rotate: -14, delay: 0.2 },
  { top: '40%', size: 40, rotate: 26, delay: 1.6 },
  { top: '56%', size: 52, rotate: -6, delay: 1 },
  { top: '72%', size: 38, rotate: 20, delay: 2.3 },
  { top: '86%', size: 48, rotate: -20, delay: 0.4 },
  { top: '96%', size: 34, rotate: 10, delay: 1.4 },
]

const DASHBOARD_PREFIXES = ['/app', '/admin', '/pet-sitter']

function SidePaw({
  variant,
  item,
  side,
  mobile,
}: {
  variant: PawVariant
  item: PawItem
  side: 'left' | 'right'
  mobile?: boolean
}) {
  const isDog = variant === 'dog'

  return (
    <PawPrint
      aria-hidden
      strokeWidth={mobile ? 2 : 1.5}
      className={cn(
        'absolute paw-float drop-shadow-sm',
        isDog ? 'text-brand-700 fill-brand-200/90' : 'text-rose-600 fill-rose-200/90',
        side === 'left'
          ? mobile ? 'left-0.5' : 'left-3 xl:left-5'
          : mobile ? 'right-0.5' : 'right-3 xl:right-5',
      )}
      style={{
        top: item.top,
        width: item.size,
        height: item.size,
        opacity: mobile ? (isDog ? 0.65 : 0.6) : (isDog ? 0.55 : 0.5),
        ['--paw-rotate' as string]: `${item.rotate}deg`,
        animationDelay: `${item.delay}s`,
      }}
    />
  )
}

function PawColumn({
  items,
  variant,
  side,
  mobile,
}: {
  items: PawItem[]
  variant: PawVariant
  side: 'left' | 'right'
  mobile?: boolean
}) {
  return (
    <div
      className={cn(
        'absolute inset-y-0',
        side === 'left' ? 'left-0' : 'right-0',
        mobile ? 'w-7' : 'w-16 sm:w-20 xl:w-24',
      )}
    >
      {items.map((p, i) => (
        <SidePaw key={i} variant={variant} item={p} side={side} mobile={mobile} />
      ))}
    </div>
  )
}

/** Pattes décoratives chien (gauche) et chat (droite) */
export function PawDecorations() {
  const { pathname } = useLocation()
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p))

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35] overflow-hidden"
      aria-hidden
    >
      {/* Mobile */}
      {!isDashboard && (
        <div className="md:hidden">
          <PawColumn items={MOBILE_LEFT} variant="dog" side="left" mobile />
        </div>
      )}
      <div className="md:hidden">
        <PawColumn items={MOBILE_RIGHT} variant="cat" side="right" mobile />
      </div>

      {/* Desktop */}
      {!isDashboard && (
        <div className="hidden md:block">
          <PawColumn items={DESKTOP_LEFT} variant="dog" side="left" />
        </div>
      )}
      <div className="hidden md:block">
        <PawColumn items={DESKTOP_RIGHT} variant="cat" side="right" />
      </div>
    </div>
  )
}
