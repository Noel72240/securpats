import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { apiUrl } from '@/lib/platform'

export default function ShopDigitalDownloadPage() {
  const { token } = useParams<{ token: string }>()
  const [productName, setProductName] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [downloadsLeft, setDownloadsLeft] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Lien invalide')
      setLoading(false)
      return
    }
    void (async () => {
      try {
        const res = await fetch(apiUrl(`/api/digital-download?token=${encodeURIComponent(token)}&meta=1`))
        const data = await res.json().catch(() => ({}))
        if (!res.ok && !data.productName) {
          setError(data.error || 'Lien introuvable')
        } else {
          setProductName(data.productName || null)
          setExpiresAt(data.expiresAt || null)
          setDownloadsLeft(typeof data.downloadsLeft === 'number' ? data.downloadsLeft : null)
          if (data.error) setError(data.error)
        }
      } catch {
        setError('Impossible de vérifier ce lien. Réessayez dans quelques minutes.')
      }
      setLoading(false)
    })()
  }, [token])

  const handleDownload = async () => {
    if (!token) return
    setDownloading(true)
    setError(null)
    try {
      const res = await fetch(apiUrl('/api/digital-download'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        setError(data.error || 'Téléchargement impossible')
        setDownloading(false)
        return
      }
      if (typeof data.downloadsLeft === 'number') {
        setDownloadsLeft(Math.max(0, (downloadsLeft ?? 1) - 1))
      } else if (downloadsLeft != null) {
        setDownloadsLeft(Math.max(0, downloadsLeft - 1))
      }
      window.location.href = data.url
    } catch {
      setError('Erreur réseau')
    }
    setDownloading(false)
  }

  const expiresLabel = expiresAt
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(expiresAt))
    : null

  return (
    <PublicLayout>
      <PageSEO
        title="Téléchargement"
        description="Téléchargez votre produit numérique SécurPats."
        path={`/boutique/telecharger/${token || ''}`}
      />
      <section className="py-16 lg:py-24">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg" className="text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                <p className="text-sm">Vérification du lien…</p>
              </div>
            ) : (
              <>
                <Download className="w-12 h-12 text-brand-600 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-slate-900 mb-2">
                  {productName || 'Votre fichier'}
                </h1>
                {expiresLabel && (
                  <p className="text-xs text-slate-500 mb-1">Valable jusqu’au {expiresLabel}</p>
                )}
                {downloadsLeft != null && (
                  <p className="text-xs text-slate-500 mb-4">
                    Téléchargements restants : {downloadsLeft}
                  </p>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-left text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  size="lg"
                  icon={Download}
                  disabled={!!error || downloading || (downloadsLeft != null && downloadsLeft <= 0)}
                  loading={downloading}
                  onClick={() => void handleDownload()}
                  className="w-full"
                >
                  Télécharger le PDF
                </Button>

                <p className="text-[11px] text-slate-400 mt-4">
                  Lien personnel — ne le partagez pas. Le fichier s’ouvre via un accès sécurisé temporaire.
                </p>

                <Link to="/boutique" className="inline-block mt-6 text-sm text-brand-700 font-medium">
                  Retour à la boutique
                </Link>
              </>
            )}
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
