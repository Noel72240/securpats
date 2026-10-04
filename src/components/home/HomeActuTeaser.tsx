import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Newspaper } from 'lucide-react'
import { fetchPublishedActuPosts } from '@/lib/actu/api'
import { formatActuDate, type ActuPost } from '@/lib/actu/types'
import { useI18n } from '@/i18n/LanguageContext'

type Props = {
  /** Nombre d’articles affichés */
  limit?: number
  /** Variante compacte pour l’accueil app mobile */
  compact?: boolean
}

export function HomeActuTeaser({ limit = 3, compact = false }: Props) {
  const { t } = useI18n()
  const [posts, setPosts] = useState<ActuPost[]>([])

  useEffect(() => {
    void (async () => {
      const { posts: list } = await fetchPublishedActuPosts()
      setPosts(list.slice(0, limit))
    })()
  }, [limit])

  if (posts.length === 0) return null

  if (compact) {
    return (
      <section className="mt-8">
        <div className="flex items-end justify-between gap-3 mb-3 px-0.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700 flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" />
              {t('home.actuBadge')}
            </p>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{t('home.actuTitle')}</h2>
          </div>
          <Link to="/actu" className="text-xs font-semibold text-brand-700 shrink-0">
            {t('home.actuAll')}
          </Link>
        </div>
        <div className="space-y-3">
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/actu/${post.slug}`}
              className="flex gap-3 rounded-2xl border border-brand-100 bg-white/90 overflow-hidden active:scale-[0.99] transition-transform"
            >
              {post.coverImageUrl ? (
                <img
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  className="w-24 h-24 object-cover shrink-0 bg-brand-50"
                  loading="lazy"
                />
              ) : (
                <div className="w-24 h-24 shrink-0 bg-brand-50 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-brand-400" />
                </div>
              )}
              <div className="py-2.5 pr-3 min-w-0 flex flex-col justify-center">
                <p className="text-[11px] text-slate-500 mb-0.5">{formatActuDate(post.publishedAt)}</p>
                <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{post.title}</p>
                {post.excerpt && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-brand-50/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-3">
              <Newspaper className="w-3.5 h-3.5" />
              {t('home.actuBadge')}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">{t('home.actuTitle')}</h2>
            <p className="text-lg text-slate-600">{t('home.actuSubtitle')}</p>
          </div>
          <Link
            to="/actu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {t('home.actuAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/actu/${post.slug}`}
              className="group rounded-2xl border border-brand-100 bg-white overflow-hidden shadow-sm shadow-brand-900/5 hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden bg-brand-50">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="w-10 h-10 text-brand-300" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500 mb-2">{formatActuDate(post.publishedAt)}</p>
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
