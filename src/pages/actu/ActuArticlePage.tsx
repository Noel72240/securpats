import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { fetchActuPostBySlug, fetchPublishedActuPosts } from '@/lib/actu/api'
import { formatActuDate, splitActuParagraphs, type ActuPost } from '@/lib/actu/types'

export default function ActuArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<ActuPost | null>(null)
  const [related, setRelated] = useState<ActuPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    void (async () => {
      setLoading(true)
      const { post: found } = await fetchActuPostBySlug(slug)
      setPost(found)
      if (found) {
        const { posts } = await fetchPublishedActuPosts()
        setRelated(posts.filter(p => p.id !== found.id).slice(0, 3))
      }
      setLoading(false)
    })()
  }, [slug])

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500 text-sm">
          Chargement de l’article…
        </div>
      </PublicLayout>
    )
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Article introuvable</h1>
          <p className="text-slate-600 mb-6">Cet article n’existe pas ou n’est plus publié.</p>
          <Link to="/actu">
            <Button variant="outline" icon={ArrowLeft}>Retour à la gazette</Button>
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const paragraphs = splitActuParagraphs(post.body)
  const seoTitle = post.seoTitle || post.title
  const seoDescription = post.seoDescription || post.excerpt

  return (
    <PublicLayout>
      <PageSEO
        title={seoTitle}
        description={seoDescription}
        path={`/actu/${post.slug}`}
        keywords={post.keywords}
        article
        articleMeta={{
          publishedAt: post.publishedAt,
          modifiedAt: post.updatedAt,
          authorName: post.authorName,
          imageUrl: post.coverImageUrl || undefined,
        }}
      />

      <article className="pb-16">
        <div className="bg-gradient-to-b from-brand-50/80 to-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
            <Link
              to="/actu"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Gazette
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 mb-3">
              Gazette SécurPats
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-6">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt || undefined}>{formatActuDate(post.publishedAt)}</time>
              <span className="text-slate-300">·</span>
              <span>{post.authorName}</span>
            </div>
            {post.excerpt && (
              <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-brand-400 pl-4">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>

        {post.coverImageUrl && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-10">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
              <img
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-5 text-slate-700 text-base lg:text-[1.05rem] leading-relaxed">
            {paragraphs.map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">
              Protégez votre animal avant l’urgence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/inscription">
                <Button>Créer mon compte</Button>
              </Link>
              <Link to="/fonctionnement">
                <Button variant="outline">Comment ça marche</Button>
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <aside className="mt-14">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Dans la même gazette</h2>
              <ul className="space-y-3">
                {related.map(r => (
                  <li key={r.id}>
                    <Link
                      to={`/actu/${r.slug}`}
                      className="block p-4 rounded-xl border border-slate-100 bg-white hover:border-brand-200 hover:bg-brand-50/40 transition-colors"
                    >
                      <p className="font-semibold text-slate-900">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatActuDate(r.publishedAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>
    </PublicLayout>
  )
}
