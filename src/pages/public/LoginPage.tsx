import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2, PawPrint, ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorKind, setErrorKind] = useState<'credentials' | 'petsitter' | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrorKind(null)
    const user = await login(email, password)
    setLoading(false)

    if (!user) {
      setError(t('common.invalidCredentials'))
      setErrorKind('credentials')
      return
    }

    if (user.role === 'petsitter') {
      setError(t('login.wrongRole'))
      setErrorKind('petsitter')
      return
    }
    if (user.role === 'admin') {
      navigate('/admin')
      return
    }
    if (user.role === 'foster_family') {
      navigate('/famille-accueil')
      return
    }
    if (user.role === 'volunteer') {
      navigate('/benevole')
      return
    }

    navigate('/app')
  }

  return (
    <PublicLayout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToSite')}
          </Link>

          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4">
                <PawPrint className="w-3.5 h-3.5" />
                {t('login.badge')}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('login.title')}</h1>
              <p className="text-slate-600 text-sm">{t('login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label={t('common.email')} type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              <Input label={t('common.password')} type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              <div className="-mt-2 text-right">
                <Link to="/mot-de-passe-oublie" className="text-xs text-brand-600 font-medium hover:underline">
                  {t('common.forgotPassword')}
                </Link>
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                  {errorKind === 'petsitter' && (
                    <p className="mt-2">
                      <Link to="/pet-sitter/connexion" className="font-semibold underline text-red-900">
                        {t('login.goPetsitter')}
                      </Link>
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" icon={loading ? Loader2 : LogIn} className="w-full" disabled={loading}>
                {loading ? t('common.loggingIn') : t('login.submit')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center text-sm">
              <p className="text-slate-600">
                {t('login.noAccount')}{' '}
                <Link to="/inscription" className="text-brand-600 font-semibold hover:underline">
                  {t('login.registerLink')}
                </Link>
              </p>
              <p className="text-slate-500">
                {t('login.areYouPetsitter')}{' '}
                <Link to="/pet-sitter/connexion" className="text-blue-600 font-semibold hover:underline">
                  {t('login.petsitterLink')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
