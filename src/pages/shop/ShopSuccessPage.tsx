import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useShopCart } from '@/lib/shop/cart'

export default function ShopSuccessPage() {
  const { clearCart } = useShopCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <PublicLayout>
      <div className="font-[family-name:var(--font-shop)]">
        <PageSEO
          title="Commande confirmée"
          description="Merci pour votre commande SécurPats. Vous recevrez un e-mail de confirmation."
          path="/boutique/succes"
        />

        <section className="py-16 lg:py-24">
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <Card padding="lg" className="text-center">
              <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Merci pour votre commande !</h1>
              <p className="text-slate-600 mb-6">
                Votre paiement a été accepté. Un e-mail de confirmation vous sera envoyé avec le détail
                de la livraison.
              </p>
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
