import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Shield, ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { PETSITTER_VIP_PLAN } from '@/lib/stripe/petsitter-vip'

export default function PetSitterLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const user = await login(email, password)
    setLoading(false)

    if (!user) {
      setError('Email ou mot de passe incorrect.')
      return
    }

    if (user.role === 'owner') {
      setError('Ce compte est un compte propriétaire. Utilisez la connexion propriétaire.')
      return
    }
    if (user.role === 'admin') {
      setError('Les administrateurs se connectent via l\'espace admin.')
      return
    }

    navigate('/pet-sitter')
  }

  return (
    <PublicLayout>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-blue-50/80 to-slate-50">
        <div className="max-w-md mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>

          <Card padding="lg" className="border-2 border-blue-200 shadow-lg shadow-blue-500/5">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
                <Shield className="w-3.5 h-3.5" />
                Espace Pet-Sitter
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Connexion Pet-Sitter</h1>
              <p className="text-slate-600 text-sm">
                Accédez à votre espace VIP — abonnement {PETSITTER_VIP_PLAN.price.toFixed(2).replace('.', ',')} €/mois
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              <Input label="Mot de passe" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                  {error.includes('propriétaire') && (
                    <p className="mt-2">
                      <Link to="/connexion" className="font-semibold underline text-red-900">
                        Connexion propriétaire →
                      </Link>
                    </p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                icon={loading ? Loader2 : LogIn}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter — espace Pet-Sitter'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center text-sm">
              <p className="text-slate-600">
                Pas encore inscrit ?{' '}
                <Link to="/pet-sitter/inscription" className="text-blue-600 font-semibold hover:underline">
                  Devenir Pet-Sitter VIP
                </Link>
              </p>
              <p className="text-slate-500">
                Vous êtes propriétaire d&apos;animaux ?{' '}
                <Link to="/connexion" className="text-brand-600 font-semibold hover:underline">
                  Connexion propriétaire
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
