import { cn } from '@/lib/utils'

type PawVariant = 'dog' | 'cat'

interface PawProps {
  variant: PawVariant
  className?: string
  style?: React.CSSProperties
}

/** Petite patte arrondie — chien (vert) ou chat (rose) */
function Paw({ variant, className, style }: PawProps) {
  const fill = variant === 'dog' ? '#6ee7b7' : '#fda4af'
  const pad = variant === 'dog' ? '#34d399' : '#fb7185'

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={cn('paw-print', className)}
      style={style}
    >
      {/* Coussinet principal */}
      <ellipse cx="24" cy="30" rx="11" ry="9" fill={pad} opacity="0.85" />
      {/* Doigts */}
      <ellipse cx="12" cy="16" rx="5" ry="6.5" fill={fill} opacity="0.9" />
      <ellipse cx="24" cy="11" rx="5" ry="6.5" fill={fill} opacity="0.9" />
      <ellipse cx="36" cy="16" rx="5" ry="6.5" fill={fill} opacity="0.9" />
      <ellipse cx="42" cy="26" rx="4" ry="5.5" fill={fill} opacity="0.75" />
      <ellipse cx="6" cy="26" rx="4" ry="5.5" fill={fill} opacity="0.75" />
    </svg>
  )
}

const LEFT_PAWS: { top: string; size: number; rotate: number; delay: number }[] = [
  { top: '8%', size: 44, rotate: -25, delay: 0 },
  { top: '22%', size: 32, rotate: 15, delay: 1.2 },
  { top: '38%', size: 52, rotate: -10, delay: 0.6 },
  { top: '55%', size: 36, rotate: 30, delay: 2 },
  { top: '70%', size: 48, rotate: -20, delay: 0.3 },
  { top: '85%', size: 30, rotate: 12, delay: 1.5 },
]

const RIGHT_PAWS: { top: string; size: number; rotate: number; delay: number }[] = [
  { top: '12%', size: 38, rotate: 20, delay: 0.8 },
  { top: '28%', size: 50, rotate: -15, delay: 0.2 },
  { top: '44%', size: 34, rotate: 25, delay: 1.8 },
  { top: '60%', size: 46, rotate: -8, delay: 1 },
  { top: '76%', size: 32, rotate: 18, delay: 2.2 },
  { top: '90%', size: 42, rotate: -22, delay: 0.5 },
]

export function PawDecorations() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden lg:block"
      aria-hidden
    >
      {/* Pattes chien — côté gauche */}
      <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-28">
        {LEFT_PAWS.map((p, i) => (
          <Paw
            key={`dog-${i}`}
            variant="dog"
            className="absolute left-2 lg:left-4 opacity-[0.35] hover:opacity-50 transition-opacity paw-float"
            style={{
              top: p.top,
              width: p.size,
              height: p.size,
              ['--paw-rotate' as string]: `${p.rotate}deg`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Pattes chat — côté droit */}
      <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-28">
        {RIGHT_PAWS.map((p, i) => (
          <Paw
            key={`cat-${i}`}
            variant="cat"
            className="absolute right-2 lg:right-4 opacity-[0.35] hover:opacity-50 transition-opacity paw-float"
            style={{
              top: p.top,
              width: p.size,
              height: p.size,
              ['--paw-rotate' as string]: `${p.rotate}deg`,
              animationDelay: `${p.delay + 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
