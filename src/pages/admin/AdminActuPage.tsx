import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Check, Newspaper, Image as ImageIcon,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge, Card, Modal } from '@/components/ui/Card'
import {
  fetchAllActuPostsAdmin,
  upsertActuPost,
  deleteActuPost,
  setActuPostPublished,
} from '@/lib/actu/api'
import { formatActuDate, slugifyActuTitle, type ActuPost } from '@/lib/actu/types'
import { uploadActuCoverImage } from '@/lib/supabase/uploads'
import { isSupabaseConfigured } from '@/lib/supabase/client'

type Draft = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  coverImageUrl: string
  coverImageAlt: string
  seoTitle: string
  seoDescription: string
  keywordsText: string
  authorName: string
  published: boolean
  publishedAt: string
  isNew: boolean
}

function emptyDraft(): Draft {
  return {
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    coverImageUrl: '',
    coverImageAlt: '',
    seoTitle: '',
    seoDescription: '',
    keywordsText: '',
    authorName: 'SécurPats',
    published: true,
    publishedAt: new Date().toISOString().slice(0, 10),
    isNew: true,
  }
}

function postToDraft(p: ActuPost): Draft {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    coverImageUrl: p.coverImageUrl,
    coverImageAlt: p.coverImageAlt,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    keywordsText: p.keywords.join(', '),
    authorName: p.authorName,
    published: p.published,
    publishedAt: (p.publishedAt || new Date().toISOString()).slice(0, 10),
    isNew: false,
  }
}

export default function AdminActuPage() {
  const [posts, setPosts] = useState<ActuPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [query, setQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { posts: list, error: err } = await fetchAllActuPostsAdmin()
    if (err) {
      setError(err.includes('actu_posts')
        ? 'Table gazette absente : exécutez supabase/migrations/015_actu_posts.sql dans Supabase.'
        : err)
    }
    setPosts(list)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(p =>
      p.title.toLowerCase().includes(q)
      || p.slug.toLowerCase().includes(q)
      || p.excerpt.toLowerCase().includes(q),
    )
  }, [posts, query])

  const patchDraft = (updates: Partial<Draft>) => {
    setDraft(prev => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      if (updates.title !== undefined && prev.isNew) {
        const slug = slugifyActuTitle(updates.title)
        next.slug = slug
        next.id = slug
      }
      return next
    })
  }

  const onUpload = async (file: File | null) => {
    if (!file || !draft) return
    if (!isSupabaseConfigured()) {
      setError('Upload image nécessite Supabase.')
      return
    }
    setUploading(true)
    const { publicUrl, error: upErr } = await uploadActuCoverImage(file)
    setUploading(false)
    if (upErr || !publicUrl) {
      setError(upErr || 'Échec upload image')
      return
    }
    patchDraft({ coverImageUrl: publicUrl, coverImageAlt: draft.coverImageAlt || draft.title })
  }

  const save = async () => {
    if (!draft) return
    if (!draft.title.trim()) {
      setError('Le titre est obligatoire.')
      return
    }
    if (!draft.body.trim()) {
      setError('Le contenu de l’article est obligatoire.')
      return
    }

    const id = (draft.id || slugifyActuTitle(draft.title)).trim()
    const slug = (draft.slug || id).trim()
    const publishedAtIso = draft.publishedAt
      ? new Date(`${draft.publishedAt}T10:00:00`).toISOString()
      : new Date().toISOString()

    const post: ActuPost = {
      id,
      slug,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      body: draft.body.trim(),
      coverImageUrl: draft.coverImageUrl.trim(),
      coverImageAlt: (draft.coverImageAlt || draft.title).trim(),
      seoTitle: draft.seoTitle.trim(),
      seoDescription: draft.seoDescription.trim(),
      keywords: draft.keywordsText.split(/[,;\n]/).map(s => s.trim()).filter(Boolean),
      authorName: draft.authorName.trim() || 'SécurPats',
      published: draft.published,
      publishedAt: draft.published ? publishedAtIso : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setSaving(true)
    setError(null)
    const { error: err } = await upsertActuPost(post)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    setDraft(null)
    await load()
  }

  const remove = async (p: ActuPost) => {
    if (!window.confirm(`Supprimer définitivement « ${p.title} » ?`)) return
    const { error: err } = await deleteActuPost(p.id)
    if (err) setError(err)
    else await load()
  }

  const togglePublished = async (p: ActuPost) => {
    const { error: err } = await setActuPostPublished(p.id, !p.published)
    if (err) setError(err)
    else await load()
  }

  return (
    <DashboardLayout variant="admin" title="Gazette / Actu">
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gazette SécurPats</h2>
            <p className="text-sm text-slate-500 mt-1">
              Publiez un article tous les 2 jours ou chaque semaine pour le SEO.
              Titre, texte, photo — simple et rapide.
            </p>
          </div>
          <Button icon={Plus} onClick={() => setDraft(emptyDraft())}>Nouvel article</Button>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher un article…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Badge variant="info">{posts.length} article{posts.length > 1 ? 's' : ''}</Badge>
          <a href="/actu" target="_blank" rel="noreferrer" className="text-sm text-brand-700 font-medium hover:underline">
            Voir la gazette →
          </a>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">Aucun article. Rédigez le premier numéro de la gazette.</p>
            <Button icon={Plus} onClick={() => setDraft(emptyDraft())}>Écrire un article</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <Card key={p.id} className="!p-4">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {p.coverImageUrl ? (
                      <img src={p.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant={p.published ? 'success' : 'default'}>
                        {p.published ? 'Publié' : 'Brouillon'}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatActuDate(p.publishedAt) || 'Sans date'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{p.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" variant="outline" icon={Pencil} onClick={() => setDraft(postToDraft(p))}>
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={p.published ? EyeOff : Eye}
                        onClick={() => void togglePublished(p)}
                      >
                        {p.published ? 'Dépublier' : 'Publier'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        className="!text-red-600"
                        onClick={() => void remove(p)}
                      >
                        Suppr.
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!draft}
        onClose={() => !saving && setDraft(null)}
        title={draft?.isNew ? 'Nouvel article' : 'Modifier l’article'}
        size="lg"
      >
        {draft && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Input
              label="Titre *"
              value={draft.title}
              onChange={e => patchDraft({ title: e.target.value })}
              placeholder="Ex. Pourquoi désigner des référents d’urgence"
            />
            <Input
              label="Chapô / résumé (SEO + liste)"
              value={draft.excerpt}
              onChange={e => patchDraft({ excerpt: e.target.value })}
              placeholder="2–3 phrases accrocheuses"
            />
            <Textarea
              label="Contenu de l’article *"
              rows={10}
              value={draft.body}
              onChange={e => patchDraft({ body: e.target.value })}
              placeholder={'Écrivez l’article ici.\n\nSéparez les paragraphes par une ligne vide.\nIdéal SEO : 400 à 800 mots, conseils concrets.'}
            />

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-semibold text-slate-900 text-sm">Image de couverture</p>
              {draft.coverImageUrl ? (
                <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-white border">
                  <img src={draft.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg"
                    onClick={() => patchDraft({ coverImageUrl: '' })}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={e => {
                  void onUpload(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Upload}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'Upload…' : 'Choisir une image'}
              </Button>
              <Input
                label="Ou coller une URL"
                value={draft.coverImageUrl}
                onChange={e => patchDraft({ coverImageUrl: e.target.value })}
              />
            </div>

            <details className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer font-semibold text-sm text-slate-800">
                Options SEO (facultatif)
              </summary>
              <div className="space-y-3 mt-4">
                <Input
                  label="Titre SEO"
                  value={draft.seoTitle}
                  onChange={e => patchDraft({ seoTitle: e.target.value })}
                  placeholder="Laissez vide = titre de l’article"
                />
                <Input
                  label="Meta description"
                  value={draft.seoDescription}
                  onChange={e => patchDraft({ seoDescription: e.target.value })}
                  placeholder="Laissez vide = chapô"
                />
                <Input
                  label="Mots-clés (séparés par des virgules)"
                  value={draft.keywordsText}
                  onChange={e => patchDraft({ keywordsText: e.target.value })}
                />
                <Input
                  label="Auteur"
                  value={draft.authorName}
                  onChange={e => patchDraft({ authorName: e.target.value })}
                />
              </div>
            </details>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Date de publication"
                type="date"
                value={draft.publishedAt}
                onChange={e => patchDraft({ publishedAt: e.target.value })}
              />
              <label className="flex items-center gap-3 cursor-pointer self-end pb-2">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={e => patchDraft({ published: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm text-slate-800">Publier tout de suite</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <Button icon={Check} disabled={saving} onClick={() => void save()}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button variant="outline" disabled={saving} onClick={() => setDraft(null)}>Annuler</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
