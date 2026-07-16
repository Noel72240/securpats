import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Check, Package, Image as ImageIcon,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge, Card, Modal } from '@/components/ui/Card'
import {
  fetchAllShopProductsAdmin,
  upsertShopProduct,
  deleteShopProduct,
  setShopProductActive,
} from '@/lib/shop/api'
import {
  SHOP_CATEGORIES,
  DEFAULT_SIZE_OPTIONS,
  formatShopPrice,
  slugifyProductName,
  categoryLabel,
  loadShopCatalog,
  type ShopCategoryId,
  type ShopProduct,
} from '@/lib/shop/catalog'
import { uploadShopProductImage } from '@/lib/supabase/uploads'
import { isSupabaseConfigured } from '@/lib/supabase/client'

type Draft = {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  priceEuros: string
  category: ShopCategoryId
  imageUrl: string
  imageAlt: string
  highlightsText: string
  sizesEnabled: boolean
  sizes: string[]
  active: boolean
  sortOrder: string
  isNew: boolean
}

function emptyDraft(): Draft {
  return {
    id: '',
    slug: '',
    name: '',
    shortDescription: '',
    description: '',
    priceEuros: '19,90',
    category: 'colliers',
    imageUrl: '',
    imageAlt: '',
    highlightsText: '',
    sizesEnabled: false,
    sizes: ['S', 'M', 'L'],
    active: true,
    sortOrder: '100',
    isNew: true,
  }
}

function productToDraft(p: ShopProduct): Draft {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    priceEuros: (p.priceCents / 100).toFixed(2).replace('.', ','),
    category: p.category,
    imageUrl: p.imageUrl,
    imageAlt: p.imageAlt,
    highlightsText: p.highlights.join('\n'),
    sizesEnabled: p.sizesEnabled,
    sizes: p.sizes.length ? p.sizes : ['S', 'M', 'L'],
    active: p.active,
    sortOrder: String(p.sortOrder),
    isNew: false,
  }
}

function parsePriceToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

export default function AdminShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([])
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
    const { products: list, error: err } = await fetchAllShopProductsAdmin()
    if (err) setError(err.includes('shop_products')
      ? 'Table boutique absente : exécutez supabase/migrations/014_shop_products.sql dans Supabase.'
      : err)
    setProducts(list)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.slug.toLowerCase().includes(q)
      || p.category.includes(q),
    )
  }, [products, query])

  const openCreate = () => setDraft(emptyDraft())
  const openEdit = (p: ShopProduct) => setDraft(productToDraft(p))

  const patchDraft = (updates: Partial<Draft>) => {
    setDraft(prev => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      if (updates.name !== undefined && prev.isNew) {
        const slug = slugifyProductName(updates.name)
        next.slug = slug
        next.id = slug
      }
      return next
    })
  }

  const toggleSize = (size: string) => {
    setDraft(prev => {
      if (!prev) return prev
      const has = prev.sizes.includes(size)
      return {
        ...prev,
        sizes: has ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
      }
    })
  }

  const onUpload = async (file: File | null) => {
    if (!file || !draft) return
    if (!isSupabaseConfigured()) {
      setError('Upload image nécessite Supabase.')
      return
    }
    setUploading(true)
    const { publicUrl, error: upErr } = await uploadShopProductImage(file)
    setUploading(false)
    if (upErr || !publicUrl) {
      setError(upErr || 'Échec upload image')
      return
    }
    patchDraft({ imageUrl: publicUrl, imageAlt: draft.imageAlt || draft.name })
  }

  const save = async () => {
    if (!draft) return
    const cents = parsePriceToCents(draft.priceEuros)
    if (!draft.name.trim()) {
      setError('Le titre du produit est obligatoire.')
      return
    }
    if (cents === null) {
      setError('Prix invalide (ex. 19,90).')
      return
    }
    if (draft.sizesEnabled && draft.sizes.length === 0) {
      setError('Activez au moins une taille, ou désactivez les tailles.')
      return
    }

    const id = (draft.id || slugifyProductName(draft.name)).trim()
    const slug = (draft.slug || id).trim()
    const product: ShopProduct = {
      id,
      slug,
      name: draft.name.trim(),
      shortDescription: draft.shortDescription.trim(),
      description: draft.description.trim(),
      priceCents: cents,
      category: draft.category,
      imageUrl: draft.imageUrl.trim(),
      imageAlt: (draft.imageAlt || draft.name).trim(),
      highlights: draft.highlightsText.split('\n').map(s => s.trim()).filter(Boolean),
      sizesEnabled: draft.sizesEnabled,
      sizes: draft.sizesEnabled ? draft.sizes : [],
      active: draft.active,
      sortOrder: Number(draft.sortOrder) || 100,
    }

    setSaving(true)
    setError(null)
    const { error: err } = await upsertShopProduct(product)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    setDraft(null)
    await load()
    await loadShopCatalog()
  }

  const remove = async (p: ShopProduct) => {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ?`)) return
    const { error: err } = await deleteShopProduct(p.id)
    if (err) setError(err)
    else await load()
  }

  const toggleActive = async (p: ShopProduct) => {
    const { error: err } = await setShopProductActive(p.id, !p.active)
    if (err) setError(err)
    else await load()
  }

  return (
    <DashboardLayout variant="admin" title="Boutique">
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gestion boutique</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ajoutez, modifiez prix / photos / tailles. Les changements apparaissent tout de suite sur le site.
            </p>
          </div>
          <Button icon={Plus} onClick={openCreate}>Nouveau produit</Button>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher un produit…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <Badge variant="info">{products.length} produit{products.length > 1 ? 's' : ''}</Badge>
          <a href="/boutique" target="_blank" rel="noreferrer" className="text-sm text-brand-700 font-medium hover:underline">
            Voir la boutique →
          </a>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-12">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">Aucun produit. Créez le premier article.</p>
            <Button icon={Plus} onClick={openCreate}>Ajouter un produit</Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <Card key={p.id} className="!p-0 overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-slate-100 relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant={p.active ? 'success' : 'default'}>{p.active ? 'En ligne' : 'Masqué'}</Badge>
                    {p.sizesEnabled && <Badge variant="info">Tailles</Badge>}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{categoryLabel(p.category)}</p>
                  <h3 className="font-semibold text-slate-900 leading-snug">{p.name}</h3>
                  <p className="text-lg font-bold text-brand-700">{formatShopPrice(p.priceCents)}</p>
                  {p.sizesEnabled && (
                    <p className="text-xs text-slate-500">Tailles : {p.sizes.join(', ')}</p>
                  )}
                  <div className="mt-auto pt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" icon={Pencil} onClick={() => openEdit(p)}>Modifier</Button>
                    <Button size="sm" variant="ghost" icon={p.active ? EyeOff : Eye} onClick={() => void toggleActive(p)}>
                      {p.active ? 'Masquer' : 'Publier'}
                    </Button>
                    <Button size="sm" variant="ghost" icon={Trash2} className="!text-red-600" onClick={() => void remove(p)}>
                      Suppr.
                    </Button>
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
        title={draft?.isNew ? 'Nouveau produit' : 'Modifier le produit'}
        size="lg"
      >
        {draft && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Titre du produit *" value={draft.name} onChange={e => patchDraft({ name: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Catégorie</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white"
                  value={draft.category}
                  onChange={e => patchDraft({ category: e.target.value as ShopCategoryId })}
                >
                  {SHOP_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Prix (€) *"
                value={draft.priceEuros}
                onChange={e => patchDraft({ priceEuros: e.target.value })}
                placeholder="19,90"
              />
              <Input
                label="Ordre d’affichage"
                value={draft.sortOrder}
                onChange={e => patchDraft({ sortOrder: e.target.value })}
                placeholder="10 = en premier"
              />
            </div>

            <Input
              label="Résumé (1 ligne)"
              value={draft.shortDescription}
              onChange={e => patchDraft({ shortDescription: e.target.value })}
            />
            <Textarea
              label="Description complète"
              rows={4}
              value={draft.description}
              onChange={e => patchDraft({ description: e.target.value })}
            />
            <Textarea
              label="Points forts (1 par ligne)"
              rows={3}
              value={draft.highlightsText}
              onChange={e => patchDraft({ highlightsText: e.target.value })}
              placeholder={'Nylon renforcé\nBoucle sécurisée'}
            />

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-semibold text-slate-900 text-sm">Photo produit</p>
              {draft.imageUrl ? (
                <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden bg-white border">
                  <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg"
                    onClick={() => patchDraft({ imageUrl: '' })}
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
                label="Ou coller une URL d’image"
                value={draft.imageUrl}
                onChange={e => patchDraft({ imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.sizesEnabled}
                  onChange={e => patchDraft({ sizesEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-brand-600"
                />
                <span className="font-semibold text-slate-900 text-sm">
                  Activer les tailles pour ce produit
                </span>
              </label>
              {draft.sizesEnabled && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {DEFAULT_SIZE_OPTIONS.map(size => {
                    const on = draft.sizes.includes(size)
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`min-w-[3rem] px-3 py-2 rounded-lg text-sm font-semibold border ${
                          on
                            ? 'bg-brand-700 text-white border-brand-700'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={e => patchDraft({ active: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-brand-600"
              />
              <span className="text-sm text-slate-800">Produit visible dans la boutique</span>
            </label>

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
