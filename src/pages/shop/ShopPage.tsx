import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Shield, Truck, Sparkles } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import {
  SHOP_CATEGORIES,
  SHOP_PRODUCTS,
  formatShopPrice,
  type ShopCategoryId,
} from '@/lib/shop/catalog'
import { useShopCart } from '@/lib/shop/cart'

export default function ShopPage() {
  const [category, setCategory] = useState<ShopCategoryId | 'all'>('all')
  const { itemCount } = useShopCart()

  const products = useMemo(
    () => (category === 'all' ? SHOP_PRODUCTS : SHOP_PRODUCTS.filter(p => p.category === category)),
    [category],
  )

  return (
    <PublicLayout>
      <div className="font-[family-name:var(--font-shop)]">
        <PageSEO
          title="Boutique — accessoires animaux"
          description="Colliers, longes, plaques QR, jouets et kits urgence SécurPats. Accessoires pensés pour la sécurité de votre animal."
          path="/boutique"
        />

        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50">
          <div className="absolute top-10 right-10 w-64 h-64 bg-brand-200/60 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nouvelle boutique SécurPats
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Boutique <span className="text-brand-600">SécurPats</span>
                </h1>
                <p className="text-lg text-slate-600">
                  Accessoires premium pour chiens et chats : plaques QR, colliers, longes et jouets
                  compatibles avec votre fiche de secours.
                </p>
                <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-brand-500" /> QR relié à la fiche urgence
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-500" /> Livraison offerte dès 40 €
                  </span>
                </div>
              </div>

              <Link to="/boutique/panier" className="shrink-0">
                <Button size="lg" icon={ShoppingBag} className="relative">
                  Voir le panier
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-white text-brand-700 text-xs font-bold border border-brand-200 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  category === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-200 hover:text-brand-700',
                )}
              >
                Tous
              </button>
              {SHOP_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                    category === cat.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-200 hover:text-brand-700',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link key={product.id} to={`/boutique/${product.slug}`} className="group">
                  <Card hover padding="sm" className="h-full overflow-hidden !p-0">
                    <div className="aspect-[4/3] overflow-hidden bg-brand-50">
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-1">
                        {SHOP_CATEGORIES.find(c => c.id === product.category)?.label}
                      </p>
                      <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-700 transition-colors">
                        {product.name}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{product.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-extrabold text-slate-900">
                          {formatShopPrice(product.priceCents)}
                        </span>
                        <span className="text-sm font-semibold text-brand-600">Voir le produit →</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
