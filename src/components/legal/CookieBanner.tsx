import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { acceptAllCookies, hasCookieConsent, rejectOptionalCookies } from '@/lib/legal/cookies'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasCookieConsent())
  }, [])

  if (!visible) return null

  const handleAccept = () => {
    acceptAllCookies()
    setVisible(false)
  }

  const handleReject = () => {
    rejectOptionalCookies()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-600/20 items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 id="cookie-banner-title" className="font-semibold text-white text-sm sm:text-base">
                Respect de votre vie privée
              </h2>
              <button
                type="button"
                onClick={handleReject}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p id="cookie-banner-desc" className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Nous utilisons des cookies et stockages locaux strictement nécessaires au fonctionnement du service
              (session, préférences). Aucun cookie publicitaire n&apos;est déposé. Le paiement Stripe n&apos;est activé
              que lorsque vous souscrivez un abonnement.{' '}
              <Link to="/cookies" className="text-brand-400 hover:underline">Politique cookies</Link>
              {' · '}
              <Link to="/confidentialite" className="text-brand-400 hover:underline">Confidentialité</Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl py-2.5 px-4 transition-colors"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl py-2.5 px-4 border border-slate-600 transition-colors"
              >
                Continuer sans cookies optionnels
              </button>
              <Link
                to="/cookies"
                className="flex-1 text-center text-sm text-slate-300 hover:text-white py-2.5 px-4 underline underline-offset-2"
              >
                Personnaliser
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
