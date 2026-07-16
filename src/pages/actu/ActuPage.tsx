import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Newspaper } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Card } from '@/components/ui/Card'
import { fetchPublishedActuPosts } from '@/lib/actu/api'
import { formatActuDate, type ActuPost } from '@/lib/actu/types'

export default function ActuPage() {
  const [posts, setPosts] = useState<ActuPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const { posts: list, error: err } = await fetchPublishedActuPosts()
      if (err?.includes('actu_posts')) {
        setError('La gazette sera bientôt disponible.')
      } else if (err) {
        setError(err)
      }
      setPosts(list)
      setLoading(false)
    })()
  }, [])

  return (
    <PublicLayout>
      <PageSEO
        title="Actu & Gazette"
        description="La gazette SécurPats : conseils, actualités et guides pour protéger votre animal en cas d’urgence."
        path="/actu"
        keywords={['actu SécurPats', 'gazette animal urgence', 'conseils protection animal']}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50/40 border-b border-brand-100/60">
        <div className="absolute -top-16 right-0 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Gazette SécurPats
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            L’actu <span className="text-brand-600">protection animale</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Conseils pratiques, rappels utiles et articles pour anticiper l’urgence —
            publiés régulièrement pour vous et pour le référencement de ces sujets essentiels.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-slate-500 text-sm text-center py-16">Chargement de la gazette…</p>
          ) : error ? (
            <p className="text-slate-500 text-sm text-center py-16">{error}</p>
          ) : posts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-16">
              Aucun article pour le moment. Revenez bientôt.
            </p>
          ) : (
            <div className="space-y-8">
              {posts.map((post, index) => (
                <Link key={post.id} to={`/actu/${post.slug}`} className="block group">
                  <Card hover padding="sm" className="!p-0 overflow-hidden">
                    <div className={`grid ${post.coverImageUrl ? 'md:grid-cols-[240px_1fr]' : ''} gap-0`}>
                      {post.coverImageUrl && (
                        <div className="aspect-[16/10] md:aspect-auto md:min-h-[180px] overflow-hidden bg-brand-50">
                          <img
                            src={post.coverImageUrl}
                            alt={post.coverImageAlt}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            loading={index < 2 ? 'eager' : 'lazy'}
                          />
                        </div>
                      )}
                      <div className="p-6 lg:p-7 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatActuDate(post.publishedAt)}
                          <span className="text-slate-300">·</span>
                          <span>{post.authorName}</span>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2">
                          {post.title}
                        </h2>
                        <p className="text-slate-600 text-sm lg:text-base line-clamp-3 mb-3">
                          {post.excerpt}
                        </p>
                        <span className="text-sm font-semibold text-brand-600">Lire l’article →</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
