import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!termsAccepted || !privacyAccepted) {
      setError('Vous devez accepter les CGU et la politique de confidentialité.')
      return
    }
    setLoading(true)
    const { confirm, ...signupFields } = form
    const result = await register({
      ...signupFields,
      consent: { termsAccepted, privacyAccepted, marketingOptIn },
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setSuccess('Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.')
      return
    }
    navigate('/app/abonnement')
  }

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
              <p className="text-slate-600 text-sm">Protégez vos animaux en quelques minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                <Input label="Nom" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Téléphone" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label="Mot de passe" type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <Input label="Confirmer le mot de passe" type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    J&apos;accepte les <Link to="/cgu" target="_blank" className="text-brand-600 hover:underline">Conditions Générales d&apos;Utilisation</Link> *
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    J&apos;accepte la <Link to="/confidentialite" target="_blank" className="text-brand-600 hover:underline">politique de confidentialité</Link> et le traitement de mes données (RGPD) *
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>Je souhaite recevoir des informations sur les nouveautés SécurPats (optionnel)</span>
                </label>
              </div>

              {success && (
                <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800 text-center">
                  {success}
                  <p className="mt-2">
                    <Link to="/connexion" className="font-semibold underline">Aller à la connexion</Link>
                  </p>
                </div>
              )}
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" icon={loading ? Loader2 : UserPlus} className="w-full" disabled={loading || !!success}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-brand-600 font-semibold hover:underline">Connectez-vous</Link>
            </p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
