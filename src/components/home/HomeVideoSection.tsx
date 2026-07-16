import { Play } from 'lucide-react'

/** Convertit une URL YouTube / Vimeo / mp4 en source lecture. */
export function resolveHomeVideoEmbed(url: string): {
  kind: 'iframe' | 'video' | null
  src: string
} {
  const raw = url.trim()
  if (!raw) return { kind: null, src: '' }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(raw)) {
    return { kind: 'video', src: raw }
  }

  try {
    const u = new URL(raw)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      if (id) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop()
      if (id && id !== 'watch' && id !== 'embed') {
        return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` }
      }
      if (u.pathname.includes('/embed/')) {
        return { kind: 'iframe', src: `https://www.youtube-nocookie.com${u.pathname}` }
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id && /^\d+$/.test(id)) {
        return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` }
      }
    }
  } catch {
    /* ignore */
  }

  if (raw.startsWith('https://') || raw.startsWith('http://')) {
    return { kind: 'iframe', src: raw }
  }

  return { kind: null, src: '' }
}

export function HomeVideoSection({
  enabled,
  title,
  videoUrl,
}: {
  enabled: boolean
  title: string
  videoUrl: string
}) {
  if (!enabled) return null

  const embed = resolveHomeVideoEmbed(videoUrl)
  const heading = title.trim() || 'Découvrez SécurPats en vidéo'

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 mb-3">
            En vidéo
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            {heading}
          </h2>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200">
          {embed.kind === 'iframe' ? (
            <iframe
              src={embed.src}
              title={heading}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : embed.kind === 'video' ? (
            <video
              className="absolute inset-0 w-full h-full object-contain bg-black"
              src={embed.src}
              controls
              playsInline
              preload="metadata"
            >
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-900 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Play className="w-7 h-7 text-white ml-0.5" />
              </div>
              <p className="text-white font-semibold text-lg">Vidéo à venir</p>
              <p className="text-slate-300 text-sm max-w-sm">
                L’emplacement est prêt. Ajoutez l’URL de la vidéo depuis l’admin (Accueil &amp; Images).
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
