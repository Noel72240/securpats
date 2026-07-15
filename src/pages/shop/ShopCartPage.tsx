import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { arePaymentsBlocked } from '@/lib/maintenance'
import {
  formatShopPrice,
  getProductById,
  orderTotalCents,
  remainingForFreeShippingCents,
  shippingCentsForSubtotal,
  SHOP_FREE_SHIPPING_FROM_CENTS,
} from '@/lib/shop/catalog'
import { useShopCart } from '@/lib/shop/cart'
import { createShopCheckout } from '@/lib/shop/checkout'

export default function ShopCartPage() {
  const { siteSettings, currentUser } = useApp()
  const { items, subtotalCents, setQuantity, removeItem } = useShopCart()
  const [searchParams] = useSearchParams()
  const canceled = searchParams.get('canceled')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const paymentsBlocked = arePaymentsBlocked(siteSettings)
  const shippingCents = shippingCentsForSubtotal(subtotalCents)
  const totalCents = orderTotalCents(subtotalCents)
  const remainingFree = remainingForFreeShippingCents(subtotalCents)

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (paymentsBlocked) {
      setError('Les paiements sont temporairement suspendus. Réessayez ultérieurement.')
      return
    }

    setLoading(true)
    setError('')
    const result = await createShopCheckout({
      items,
      customerEmail: email,
    })
    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="font-[family-name:var(--font-shop)]">
        <PageSEO
          title="Panier boutique"
          description="Votre panier SécurPats — colliers, longes, plaques QR et accessoires pour animaux."
          path="/boutique/panier"
        />

        <section className="py-10 lg:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Continuer mes achats
            </Link>

            <h1 className="text-3xl font-bold text-slate-900 mb-6">Mon panier</h1>

            {canceled && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                Paiement annulé. Votre panier a été conservé.
              </div>
            )}

            {paymentsBlocked && (
              <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800">
                  {siteSettings.maintenance.message || 'Les paiements sont temporairement suspendus.'}
                </p>
              </div>
            )}

            {items.length === 0 ? (
              <Card>
                <EmptyState
                  icon={ShoppingBag}
                  title="Votre panier est vide"
                  description="Découvrez nos accessoires pour sécuriser votre animal."
                  action={
                    <Link to="/boutique">
                      <Button>Parcourir la boutique</Button>
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {items.map(line => {
                    const product = getProductById(line.productId)
                    if (!product) return null
                    return (
                      <Card key={line.productId} className="!p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-brand-50 shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.imageAlt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Link
                                  to={`/boutique/${product.slug}`}
                                  className="font-semibold text-slate-900 hover:text-brand-700"
                                >
                                  {product.name}
                                </Link>
                                <p className="text-sm text-slate-500 mt-1">
                                  {formatShopPrice(product.priceCents)} / unité
                                </p>
                              </div>
                              <button
                                type="button"
                                aria-label={`Retirer ${product.name}`}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeItem(line.productId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden">
                                <button
                                  type="button"
                                  aria-label="Diminuer"
                                  className="p-2 hover:bg-brand-50"
                                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-semibold">{line.quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Augmenter"
                                  className="p-2 hover:bg-brand-50"
                                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="font-bold text-slate-900">
                                {formatShopPrice(product.priceCents * line.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                <div>
                  <Card padding="lg" className="sticky top-24">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Récapitulatif</h2>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <dt>Sous-total</dt>
                        <dd className="font-medium text-slate-900">{formatShopPrice(subtotalCents)}</dd>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <dt>Livraison</dt>
                        <dd className="font-medium text-slate-900">
                          {shippingCents === 0 ? 'Offerte' : formatShopPrice(shippingCents)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                        <dt>Total</dt>
                        <dd>{formatShopPrice(totalCents)}</dd>
                      </div>
                    </dl>

                    {remainingFree > 0 && (
                      <p className="text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 mt-4">
                        Plus que {formatShopPrice(remainingFree)} pour la livraison offerte
                        (dès {formatShopPrice(SHOP_FREE_SHIPPING_FROM_CENTS)}).
                      </p>
                    )}

                    <label className="block mt-6">
                      <span className="text-sm font-medium text-slate-700">E-mail (facultatif)</span>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="vous@exemple.fr"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      />
                    </label>

                    {error && (
                      <p className="text-sm text-red-600 mt-4">{error}</p>
                    )}

                    <Button
                      className="w-full mt-6"
                      size="lg"
                      loading={loading}
                      disabled={paymentsBlocked}
                      onClick={() => void handleCheckout()}
                    >
                      Payer avec Stripe
                    </Button>

                    <p className="text-xs text-slate-500 mt-3 text-center">
                      Paiement sécurisé · France, Belgique, Luxembourg, Suisse
                    </p>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
