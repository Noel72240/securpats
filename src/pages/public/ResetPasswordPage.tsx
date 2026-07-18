import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { updatePasswordWithRecovery } from '@/lib/auth/password-reset'
import { useI18n } from '@/i18n/LanguageContext'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase non configuré')
      return
    }

    const supabase = getSupabase()
    let cancelled = false

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setReady(true)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError(t('reset.mismatch'))
      return
    }
    setLoading(true)
    setError('')
    const err = await updatePasswordWithRecovery(password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setDone(true)
    window.setTimeout(() => navigate('/connexion'), 2500)
  }

  return (
    <PublicLayout>
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-4">
                <KeyRound className="w-3.5 h-3.5" />
                {t('reset.badge')}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('reset.title')}</h1>
            </div>

            {done ? (
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-900 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{t('reset.done')}</p>
              </div>
            ) : !ready ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p>{t('reset.waiting')}</p>
                {error && <p className="text-red-700">{error}</p>}
                <p>
                  <Link to="/mot-de-passe-oublie" className="text-brand-600 font-semibold underline">
                    {t('reset.requestLink')}
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={e => void handleSubmit(e)} className="space-y-5">
                <Input
                  label={t('reset.newPassword')}
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Input
                  label={t('reset.confirm')}
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                />
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}
                <Button type="submit" icon={loading ? Loader2 : KeyRound} className="w-full" disabled={loading}>
                  {loading ? t('reset.saving') : t('reset.submit')}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
