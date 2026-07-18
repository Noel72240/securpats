import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { createContactMessage } from '@/lib/supabase/services'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'

export default function ContactPage() {
  const { siteSettings } = useApp()
  const { t } = useI18n()
  const { contact, legal } = siteSettings
  const [sent, setSent] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setError(t('contact.mustConsent'))
      return
    }
    setError('')
    if (isSupabaseConfigured()) {
      await createContactMessage({ ...form, consentGiven: true })
    }
    setSent(true)
  }

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('contact.title')}</h1>
            <p className="text-lg text-slate-600">{t('contact.subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Mail className="w-6 h-6 text-brand-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{t('contact.email')}</h3>
                <a href={`mailto:${contact.email}`} className="text-sm text-slate-600 hover:text-brand-600">{contact.email}</a>
              </Card>
              {contact.phone && (
                <Card>
                  <Phone className="w-6 h-6 text-brand-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">{t('contact.phone')}</h3>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-sm text-slate-600 hover:text-brand-600">{contact.phone}</a>
                </Card>
              )}
              <Card>
                <MapPin className="w-6 h-6 text-brand-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{t('contact.address')}</h3>
                <p className="text-sm text-slate-600">
                  {contact.addressLine1}
                  {contact.addressLine2 && <><br />{contact.addressLine2}</>}
                  <br />{contact.postalCode} {contact.city}, {contact.country}
                </p>
              </Card>
            </div>

            <Card padding="lg" className="lg:col-span-3">
              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t('contact.sentTitle')}</h3>
                  <p className="text-slate-600">{t('contact.sentDesc')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('contact.privacyNote', {
                      company: siteSettings.legal.companyName || siteSettings.siteName,
                      dpo: legal.dpoEmail,
                    })}
                    {' '}<Link to="/confidentialite" className="text-brand-600 hover:underline">{t('contact.learnMore')}</Link>.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label={t('contact.fullName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input label={t('contact.email')} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <Input label={t('contact.subject')} required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  <Textarea label={t('contact.message')} required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  <label className="flex items-start gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    {t('contact.consent')}
                  </label>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full sm:w-auto">{t('contact.send')}</Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
