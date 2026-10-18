import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Download, ShoppingBag } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useShopCart } from '@/lib/shop/cart'
import { apiUrl } from '@/lib/platform'

type DigitalDownload = {
  productId: string
  productName: string
  token: string
  pageUrl: string
  expiresAt: string
}

export default function ShopSuccessPage() {
  const { clearCart, reloadCatalog } = useShopCart()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [downloads, setDownloads] = useState<DigitalDownload[]>([])
  const [loadingDigital, setLoadingDigital] = useState(!!sessionId)

  useEffect(() => {
    clearCart()
    void (async () => {
      if (sessionId) {
        try {
          const res = await fetch(apiUrl('/api/stripe/verify-session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          const data = await res.json().catch(() => ({}))
          if (Array.isArray(data.downloads)) {
            setDownloads(data.downloads as DigitalDownload[])
          }
        } catch {
          // Le webhook Stripe reste la source principale
        }
      }
      setLoadingDigital(false)
      await reloadCatalog()
    })()
  }, [clearCart, reloadCatalog, sessionId])

  return (
    <PublicLayout>
      <div className="font-[family-name:var(--font-shop)]">
        <PageSEO
          title="Commande confirmée"
          description="Merci pour votre commande SécurPats. Vous recevrez un e-mail de confirmation."
          path="/boutique/succes"
        />

        <section className="py-16 lg:py-24">
          <div className="max-w-lg mx-auto px-4 sm:px-6 space-y-6">
            <Card padding="lg" className="text-center">
              <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Merci pour votre commande !</h1>
              <p className="text-slate-600 mb-6">
                Votre paiement a été accepté.
                {downloads.length > 0
                  ? ' Votre produit numérique est prêt ci-dessous (et envoyé par e-mail).'
                  : ' Un e-mail de confirmation vous sera envoyé.'}
              </p>

              {loadingDigital && (
                <p className="text-sm text-slate-500 mb-4">Préparation de vos téléchargements…</p>
              )}

              {downloads.length > 0 && (
                <div className="text-left space-y-3 mb-6">
                  {downloads.map(d => (
                    <div
                      key={d.token}
                      className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{d.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Lien personnel — valable quelques jours</p>
                      </div>
                      <Link to={`/boutique/telecharger/${d.token}`}>
                        <Button size="sm" icon={Download}>Télécharger</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/boutique">
                  <Button icon={ShoppingBag}>Retour à la boutique</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Retour à l’accueil</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
