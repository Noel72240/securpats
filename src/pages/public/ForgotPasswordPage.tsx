import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KeyRound, Loader2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { requestPasswordReset } from '@/lib/auth/password-reset'
import { useI18n } from '@/i18n/LanguageContext'

export default function ForgotPasswordPage() {
  const [params] = useSearchParams()
  const expired = params.get('reason') === 'expired'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await requestPasswordReset(email)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setSent(true)
  }

  return (
    <PublicLayout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <Link
            to="/connexion"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forgot.back')}
          </Link>

          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4">
                <KeyRound className="w-3.5 h-3.5" />
                {t('forgot.badge')}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('forgot.title')}</h1>
              <p className="text-slate-600 text-sm">{t('forgot.subtitle')}</p>
            </div>

            {expired && !sent && (
              <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t('forgot.expiredTitle')}</p>
                  <p className="mt-1">{t('forgot.expiredBody')}</p>
                </div>
              </div>
            )}

            {sent ? (
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-900 space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('forgot.sentTitle')}
                </p>
                <p>{t('forgot.sentBody', { email })}</p>
                <p className="pt-2">
                  <Link to="/connexion" className="font-semibold underline">{t('nav.ownerLogin')}</Link>
                  {' · '}
                  <Link to="/pet-sitter/connexion" className="font-semibold underline">{t('nav.petSitterLogin')}</Link>
                </p>
              </div>
            ) : (
              <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
                <Input
                  label={t('forgot.emailLabel')}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}
                <Button type="submit" icon={loading ? Loader2 : KeyRound} className="w-full" disabled={loading}>
                  {loading ? t('forgot.sending') : t('forgot.submit')}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
