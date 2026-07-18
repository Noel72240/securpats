import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Heart, HandHeart, ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { CAREGIVER_SPACES, homePathForRole } from '@/lib/caregiver/spaces'
import type { CaregiverKind } from '@/types'

export default function CaregiverLoginPage({ kind }: { kind: CaregiverKind }) {
  const space = CAREGIVER_SPACES[kind]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()
  const prefix = kind === 'foster_family' ? 'fosterLogin' : 'volunteerLogin'
  const Icon = kind === 'foster_family' ? Heart : HandHeart

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const user = await login(email, password)
    setLoading(false)

    if (!user) {
      setError(t('common.invalidCredentials'))
      return
    }

    if (user.role !== space.role) {
      setError(t(`${prefix}.wrongRole` as 'fosterLogin.wrongRole'))
      return
    }

    navigate(homePathForRole(user.role))
  }

  return (
    <PublicLayout>
      <section className={`py-12 sm:py-16 lg:py-20 ${kind === 'foster_family' ? 'bg-gradient-to-b from-teal-50/80 to-slate-50' : 'bg-gradient-to-b from-amber-50/80 to-slate-50'}`}>
        <div className="max-w-md mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToSite')}
          </Link>

          <Card padding="lg" className={`border-2 shadow-lg ${kind === 'foster_family' ? 'border-teal-200 shadow-teal-500/5' : 'border-amber-200 shadow-amber-500/5'}`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${kind === 'foster_family' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                <Icon className="w-3.5 h-3.5" />
                {t(`${prefix}.badge` as 'fosterLogin.badge')}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t(`${prefix}.title` as 'fosterLogin.title')}</h1>
              <p className="text-slate-600 text-sm">{t(`${prefix}.subtitle` as 'fosterLogin.subtitle')}</p>
            </div>

            <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
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
                </div>
              )}
              <Button type="submit" icon={loading ? Loader2 : LogIn} className="w-full" variant={kind === 'volunteer' ? 'blue' : 'primary'} disabled={loading}>
                {loading ? t('common.loading') : t('common.login')}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
              {t(`${prefix}.noAccount` as 'fosterLogin.noAccount')}{' '}
              <Link to={`${space.basePath}/inscription`} className="font-semibold text-brand-600 hover:underline">
                {t(`${prefix}.register` as 'fosterLogin.register')}
              </Link>
            </p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
