import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'

export default function LoginPage() {
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
    if (user) {
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'petsitter') navigate('/pet-sitter')
      else navigate('/app')
    } else {
      setError('Email ou mot de passe incorrect. Créez un compte si vous n\'en avez pas encore.')
    }
  }

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Connexion</h1>
              <p className="text-slate-600 text-sm">Accédez à votre espace SécurPats</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              <Input label="Mot de passe" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" icon={loading ? Loader2 : LogIn} className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-brand-600 font-semibold hover:underline">Inscrivez-vous</Link>
            </p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
