import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { FileUploadField } from '@/components/ui/FileUploadField'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useApp()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirm) {
      setError(t('register.passwordMismatch'))
      return
    }
    if (!termsAccepted || !privacyAccepted) {
      setError(t('register.mustAccept'))
      return
    }
    if (!idFile || !proofFile) {
      setError('Pièce d’identité et justificatif de domicile sont obligatoires.')
      return
    }
    setLoading(true)
    const { confirm, ...signupFields } = form
    const result = await register({
      ...signupFields,
      idFile,
      proofFile,
      consent: { termsAccepted, privacyAccepted, marketingOptIn },
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setSuccess(t('register.emailConfirm'))
      return
    }
    navigate('/app')
  }

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('register.title')}</h1>
              <p className="text-slate-600 text-sm">{t('register.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('common.firstName')} required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                <Input label={t('common.lastName')} required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <Input label={t('common.email')} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label={t('common.phone')} type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label={t('common.password')} type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <Input label={t('common.confirmPassword')} type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Documents obligatoires</p>
                <FileUploadField
                  label="Pièce d’identité"
                  required
                  hint="Photo ou PDF (carte d’identité, passeport…)"
                  file={idFile}
                  onChange={setIdFile}
                />
                <FileUploadField
                  label="Justificatif de domicile"
                  required
                  hint="Photo ou PDF (facture, avis d’imposition…)"
                  file={proofFile}
                  onChange={setProofFile}
                />
                <p className="text-xs text-slate-500">Un administrateur vérifiera ces documents avant d’activer votre compte.</p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    {t('register.acceptTerms')} <Link to="/cgu" className="text-brand-600 hover:underline">{t('register.termsLink')}</Link> *
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    {t('register.acceptPrivacy')} <Link to="/confidentialite" className="text-brand-600 hover:underline">{t('register.privacyLink')}</Link> {t('register.andRgpd')} *
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>{t('register.marketing')}</span>
                </label>
              </div>

              {success && (
                <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800 text-center">
                  {success}
                  <p className="mt-2">
                    <Link to="/connexion" className="font-semibold underline">{t('register.goLogin')}</Link>
                  </p>
                </div>
              )}
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" icon={loading ? Loader2 : UserPlus} className="w-full" disabled={loading || !!success}>
                {loading ? t('common.creating') : t('register.submit')}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              {t('register.hasAccount')}{' '}
              <Link to="/connexion" className="text-brand-600 font-semibold hover:underline">{t('register.loginLink')}</Link>
            </p>
            <p className="text-center text-sm text-slate-500 mt-2">
              {t('register.petsitter')}{' '}
              <Link to="/pet-sitter/inscription" className="text-blue-600 font-semibold hover:underline">
                {t('register.petsitterLink')}
              </Link>
            </p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
