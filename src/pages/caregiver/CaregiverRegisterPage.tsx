import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, HandHeart, Loader2, UserPlus, Mail } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { departmentSelectOptions } from '@/lib/geo/french-departments'
import { CAREGIVER_SPACES } from '@/lib/caregiver/spaces'
import type { CaregiverKind } from '@/types'

export default function CaregiverRegisterPage({ kind }: { kind: CaregiverKind }) {
  const space = CAREGIVER_SPACES[kind]
  const navigate = useNavigate()
  const { registerCaregiver } = useApp()
  const { t, locale } = useI18n()
  const prefix = kind === 'foster_family' ? 'fosterReg' : 'volunteerReg'

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    departmentCode: '',
    bio: '',
    password: '',
    confirm: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [awaitingEmail, setAwaitingEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const Icon = kind === 'foster_family' ? Heart : HandHeart
  const accentBtn = kind === 'foster_family' ? 'primary' : 'blue'
  const loginPath = `${space.basePath}/connexion`

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-welcome', email: form.email }),
      })
      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(payload.error || 'Impossible d’envoyer l’email')
      } else {
        setSuccess(t('register.resendOk'))
      }
    } catch {
      setError('Impossible d’envoyer l’email')
    }
    setResending(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setAwaitingEmail(false)
    if (form.password !== form.confirm) {
      setError(t('register.passwordMismatch'))
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!termsAccepted || !privacyAccepted) {
      setError(t('register.mustAccept'))
      return
    }
    if (!form.departmentCode) {
      setError(t(`${prefix}.needDepartment` as 'fosterReg.needDepartment'))
      return
    }
    setLoading(true)
    const result = await registerCaregiver({
      kind,
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      address: form.address,
      departmentCode: form.departmentCode,
      bio: form.bio,
      consent: { termsAccepted, privacyAccepted, marketingOptIn },
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setAwaitingEmail(true)
      setSuccess(t('register.emailConfirm'))
      return
    }
    if (result.readyToLogin) {
      setAwaitingEmail(true)
      setSuccess(result.message || t('register.readyToLogin'))
      return
    }
    navigate(space.basePath)
  }

  return (
    <PublicLayout>
      <section className={`py-10 sm:py-16 ${kind === 'foster_family' ? 'bg-gradient-to-b from-teal-50/80 to-slate-50' : 'bg-gradient-to-b from-amber-50/80 to-slate-50'}`}>
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${kind === 'foster_family' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
              <Icon className="w-3.5 h-3.5" />
              {t(`${prefix}.badge` as 'fosterReg.badge')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t(`${prefix}.title` as 'fosterReg.title')}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
              {t(`${prefix}.subtitle` as 'fosterReg.subtitle')}
            </p>
          </div>

          <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
            <Card padding="lg">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <UserPlus className={`w-5 h-5 ${kind === 'foster_family' ? 'text-teal-600' : 'text-amber-600'}`} />
                {t('register.subtitle')}
              </h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={t('common.firstName')} required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  <Input label={t('common.lastName')} required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <Input label={t('common.email')} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <Input label={t('common.phone')} type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <Input label={t(`${prefix}.address` as 'fosterReg.address')} required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                <Select
                  label={t(`${prefix}.department` as 'fosterReg.department')}
                  required
                  value={form.departmentCode}
                  onChange={e => setForm({ ...form, departmentCode: e.target.value })}
                  options={departmentSelectOptions(locale, t(`${prefix}.departmentHint` as 'fosterReg.departmentHint'))}
                />
                <Textarea
                  label={t(`${prefix}.bio` as 'fosterReg.bio')}
                  rows={4}
                  required
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder={t(`${prefix}.bioPlaceholder` as 'fosterReg.bioPlaceholder')}
                />
                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <Input label={t('common.password')} type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <Input label={t('common.confirmPassword')} type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-slate-300" />
                <span>
                  {t('register.acceptTerms')} <Link to="/cgu" target="_blank" className="text-brand-600 hover:underline">{t('register.termsLink')}</Link> *
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-1 rounded border-slate-300" />
                <span>
                  {t('register.acceptPrivacy')} <Link to="/confidentialite" target="_blank" className="text-brand-600 hover:underline">{t('register.privacyLink')}</Link> *
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1 rounded border-slate-300" />
                <span>{t('register.marketing')}</span>
              </label>
            </Card>

            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && (
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800 space-y-3">
                <p>{success}</p>
                {awaitingEmail && (
                  <>
                    <p className="text-brand-700/80">{t('register.emailConfirmHint')}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        icon={resending ? Loader2 : Mail}
                        disabled={resending || !form.email}
                        onClick={() => void handleResend()}
                      >
                        {resending ? t('register.resending') : t('register.resendEmail')}
                      </Button>
                      <Link to={loginPath}>
                        <Button type="button" size="sm" variant="primary">
                          {t('register.goLogin')}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {!awaitingEmail && (
              <Button type="submit" variant={accentBtn === 'blue' ? 'blue' : 'primary'} className="w-full" disabled={loading} icon={loading ? Loader2 : UserPlus}>
                {loading ? t('common.creating') : t(`${prefix}.submit` as 'fosterReg.submit')}
              </Button>
            )}

            <p className="text-center text-sm text-slate-600">
              {t('register.hasAccount')}{' '}
              <Link to={`${space.basePath}/connexion`} className="font-semibold text-brand-600 hover:underline">
                {t('common.login')}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </PublicLayout>
  )
}
