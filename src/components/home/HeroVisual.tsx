import { useRef, useState, useCallback, useMemo } from 'react'
import { QrCode, PawPrint, Heart, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'

interface HeroVisualProps {
  heroImage?: string
  heroImageAlt: string
}

const ORBIT_PAWS = [
  { angle: 0, variant: 'dog' as const, size: 28 },
  { angle: 72, variant: 'cat' as const, size: 24 },
  { angle: 144, variant: 'dog' as const, size: 22 },
  { angle: 216, variant: 'cat' as const, size: 26 },
  { angle: 288, variant: 'dog' as const, size: 20 },
]

export function HeroVisual({ heroImage, heroImageAlt }: HeroVisualProps) {
  const { t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const floatBadges = useMemo(() => [
    { icon: Heart, label: t('home.heroLoved'), className: 'top-2 left-2 sm:top-4 sm:-left-6 hero-badge-delay-1', color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { icon: Shield, label: t('home.heroProtected'), className: 'top-2 right-2 sm:-top-2 sm:-right-4 hero-badge-delay-2', color: 'text-brand-600 bg-brand-50 border-brand-200' },
    { icon: PawPrint, label: t('home.heroSecured'), className: 'bottom-[4.5rem] right-2 sm:bottom-24 sm:-right-5 hero-badge-delay-3', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ], [t])

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -y * 8, y: x * 8 })
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setGlow({ x: 50, y: 50 })
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-lg lg:max-w-none hero-visual px-1 sm:px-0"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Halo — réduit sur mobile */}
      <div
        className="absolute -inset-2 sm:-inset-6 lg:-inset-10 rounded-[2rem] hero-aurora pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(16,185,129,0.3) 0%, rgba(244,114,182,0.1) 45%, transparent 70%)`,
        }}
      />

      {/* Anneaux — desktop uniquement */}
      <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
        <div className="w-[92%] h-[92%] rounded-[2rem] border-2 border-brand-300/30 hero-pulse-ring" />
        <div className="absolute w-[105%] h-[105%] rounded-[2.2rem] border border-dashed border-brand-400/25 hero-spin-slow" />
      </div>

      {/* Orbite — tablette+ */}
      <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
        <div className="relative w-0 h-0 hero-orbit-spin">
          {ORBIT_PAWS.map((p, i) => (
            <div
              key={i}
              className="absolute hero-orbit-item hero-orbit-item-sm"
              style={{ ['--orbit-angle' as string]: `${p.angle}deg` }}
            >
              <PawPrint
                className={cn(
                  'drop-shadow-sm hero-orbit-counter',
                  p.variant === 'dog'
                    ? 'text-brand-600 fill-brand-200/70'
                    : 'text-rose-500 fill-rose-200/70',
                )}
                style={{ width: p.size, height: p.size }}
                strokeWidth={1.5}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Badges — compacts sur mobile, dans la carte */}
      {floatBadges.map(({ icon: Icon, label, className, color }) => (
        <div
          key={label}
          className={cn(
            'absolute z-20 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border shadow-md text-[10px] sm:text-xs font-semibold hero-badge-float pointer-events-none',
            color,
            className,
          )}
        >
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="hidden min-[380px]:inline">{label}</span>
        </div>
      ))}

      {/* Carte principale */}
      <div className="relative hero-card-float">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl shadow-brand-900/15 transition-transform duration-200 ease-out will-change-transform ring-2 ring-brand-300/40 sm:ring-brand-300/50"
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.02 : 1})`,
          }}
        >
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroImageAlt}
              className="relative w-full h-[240px] min-[400px]:h-[260px] sm:h-[380px] lg:h-[500px] object-cover object-center"
            />
          ) : (
            <div className="relative w-full h-[240px] min-[400px]:h-[260px] sm:h-[380px] lg:h-[500px] bg-gradient-to-br from-brand-100 to-brand-200 flex flex-col items-center justify-center">
              <PawPrint className="w-16 h-16 sm:w-24 sm:h-24 text-brand-400 mb-3 hero-paw-pulse" />
              <p className="text-brand-600 font-medium text-xs sm:text-sm px-4 text-center">Ajoutez votre image depuis l&apos;admin</p>
            </div>
          )}

          <div className="absolute inset-0 hero-shine pointer-events-none z-10" />

          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/80 z-20">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 hero-qr-icon">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">QR Code d&apos;urgence</p>
                <p className="text-xs sm:text-sm text-slate-500 leading-snug">Accès instantané aux infos vitales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattes montantes — desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl hidden sm:block">
        {[0, 1, 2].map(i => (
          <PawPrint
            key={i}
            className={cn(
              'absolute text-brand-400/40 hero-sparkle-paw',
              i === 0 && 'left-[15%] bottom-[30%]',
              i === 1 && 'left-[45%] bottom-[20%]',
              i === 2 && 'right-[20%] bottom-[35%]',
            )}
            style={{ ['--sparkle-delay' as string]: `${i * 1.8}s`, width: 18 + i * 4, height: 18 + i * 4 }}
          />
        ))}
      </div>
    </div>
  )
}
