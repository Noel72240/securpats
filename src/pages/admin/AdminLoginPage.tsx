import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@securpats.fr'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, logout, currentUser } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [currentUser, navigate])

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

    if (user.role !== 'admin') {
      await logout()
      setError('Accès réservé aux administrateurs. Utilisez la connexion standard pour votre espace.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <BrandLogo to="/" variant="icon" imageClassName="h-16 w-16 sm:h-20 sm:w-20 mx-auto" className="justify-center mb-5" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Espace Admin</h1>
          <p className="text-slate-400 mt-2 text-sm">Connexion sécurisée au back-office</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="admin-email" className="block text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={adminEmail}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-11 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-11 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-xl py-3.5 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Connexion
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
