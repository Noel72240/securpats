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

const LEFT_PAWS: PawItem[] = [
  { top: '6%', size: 52, rotate: -25, delay: 0 },
  { top: '20%', size: 38, rotate: 18, delay: 1.2 },
  { top: '36%', size: 58, rotate: -12, delay: 0.5 },
  { top: '52%', size: 42, rotate: 28, delay: 1.8 },
  { top: '68%', size: 50, rotate: -18, delay: 0.3 },
  { top: '82%', size: 36, rotate: 14, delay: 2.1 },
  { top: '94%', size: 46, rotate: -8, delay: 1 },
]

const RIGHT_PAWS: PawItem[] = [
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
}: {
  variant: PawVariant
  item: PawItem
  side: 'left' | 'right'
}) {
  const isDog = variant === 'dog'

  return (
    <PawPrint
      aria-hidden
      strokeWidth={1.5}
      className={cn(
        'absolute paw-float drop-shadow-sm',
        isDog ? 'text-brand-700 fill-brand-200/80' : 'text-rose-600 fill-rose-200/80',
        side === 'left' ? 'left-3 xl:left-5' : 'right-3 xl:right-5',
      )}
      style={{
        top: item.top,
        width: item.size,
        height: item.size,
        opacity: isDog ? 0.55 : 0.5,
        ['--paw-rotate' as string]: `${item.rotate}deg`,
        animationDelay: `${item.delay}s`,
      }}
    />
  )
}

/** Pattes décoratives chien (gauche) et chat (droite) — visibles dans les marges latérales */
export function PawDecorations() {
  const { pathname } = useLocation()
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p))

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35] overflow-hidden hidden md:block"
      aria-hidden
    >
      {!isDashboard && (
        <div className="absolute inset-y-0 left-0 w-16 sm:w-20 xl:w-24">
          {LEFT_PAWS.map((p, i) => (
            <SidePaw key={`dog-${i}`} variant="dog" item={p} side="left" />
          ))}
        </div>
      )}

      <div className="absolute inset-y-0 right-0 w-16 sm:w-20 xl:w-24">
        {RIGHT_PAWS.map((p, i) => (
          <SidePaw key={`cat-${i}`} variant="cat" item={p} side="right" />
        ))}
      </div>
    </div>
  )
}
