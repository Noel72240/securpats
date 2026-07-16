import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import {
  SHOP_CATEGORIES,
  formatShopPrice,
  getProductBySlug,
} from '@/lib/shop/catalog'
import { useShopCart } from '@/lib/shop/cart'

export default function ShopProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem, catalogReady } = useShopCart()
  const product = slug ? getProductBySlug(slug) : undefined
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState<string>('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  if (!catalogReady) {
    return (
      <PublicLayout>
        <div className="font-[family-name:var(--font-shop)] max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-slate-500">Chargement du produit…</p>
        </div>
      </PublicLayout>
    )
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="font-[family-name:var(--font-shop)] max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Produit introuvable</h1>
          <p className="text-slate-600 mb-6">Ce produit n’existe pas ou n’est plus disponible.</p>
          <Link to="/boutique">
            <Button variant="outline" icon={ArrowLeft}>Retour à la boutique</Button>
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const categoryLabel = SHOP_CATEGORIES.find(c => c.id === product.category)?.label

  const handleAddToCart = () => {
    const err = addItem(product.id, {
      quantity,
      size: product.sizesEnabled ? size : undefined,
    })
    if (err) {
      setFeedback(err)
      setAdded(false)
      return
    }
    setFeedback(null)
    setAdded(true)
  }

  return (
    <PublicLayout>
      <div className="font-[family-name:var(--font-shop)]">
        <PageSEO
          title={product.name}
          description={product.shortDescription}
          path={`/boutique/${product.slug}`}
        />

        <section className="py-10 lg:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la boutique
            </Link>

            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <Card padding="sm" className="overflow-hidden !p-0">
                <div className="aspect-square bg-brand-50">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
              </Card>

              <div>
                {categoryLabel && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-2">
                    {categoryLabel}
                  </p>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">{product.name}</h1>
                <p className="text-3xl font-extrabold text-brand-700 mb-6">
                  {formatShopPrice(product.priceCents)}
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">{product.description}</p>

                {product.highlights.length > 0 && (
                  <ul className="space-y-2 mb-8">
                    {product.highlights.map(highlight => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-brand-500 shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                {product.sizesEnabled && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-800 mb-2">Taille</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setSize(s); setFeedback(null); setAdded(false) }}
                          className={cn(
                            'min-w-[3rem] px-3 py-2 rounded-lg text-sm font-semibold border transition-colors',
                            size === s
                              ? 'bg-brand-700 text-white border-brand-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300',
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      aria-label="Diminuer la quantité"
                      className="p-3 hover:bg-brand-50 text-slate-600"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      className="p-3 hover:bg-brand-50 text-slate-600"
                      onClick={() => setQuantity(q => Math.min(20, q + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Button size="lg" icon={ShoppingCart} onClick={handleAddToCart}>
                    Ajouter au panier
                  </Button>

                  <Link to="/boutique/panier">
                    <Button variant="outline" size="lg">Voir le panier</Button>
                  </Link>
                </div>

                {feedback && (
                  <p className="text-sm text-amber-700 mt-4">{feedback}</p>
                )}
                {added && !feedback && (
                  <p className="text-sm text-brand-700 mt-4 font-medium">Ajouté au panier.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
