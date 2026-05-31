import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Upload } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function PetSitterRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', bio: '',
  })

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [idConsent, setIdConsent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted || !idConsent) {
      setError('Vous devez accepter les conditions et le traitement de vos pièces d\'identité.')
      return
    }
    navigate('/pet-sitter')
  }

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Devenir Pet-Sitter</h1>
            <p className="text-slate-600">Rejoignez notre réseau de pet-sitters certifiés.</p>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Prénom" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                <Input label="Nom" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Téléphone" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input label="Adresse" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <Textarea label="Présentation" required rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">Pièce d'identité</span>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-300 cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Upload simulé</p>
                    <input type="file" className="hidden" />
                  </div>
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-slate-700 mb-1.5">Justificatif domicile</span>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-300 cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Upload simulé</p>
                    <input type="file" className="hidden" />
                  </div>
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    J&apos;accepte les <Link to="/cgu" target="_blank" className="text-brand-600 hover:underline">CGU</Link> et la{' '}
                    <Link to="/confidentialite" target="_blank" className="text-brand-600 hover:underline">politique de confidentialité</Link> *
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={idConsent} onChange={e => setIdConsent(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    J&apos;accepte le traitement de ma pièce d&apos;identité et de mon justificatif de domicile
                    aux seules fins de vérification de mon profil pet-sitter (RGPD) *
                  </span>
                </label>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" icon={UserPlus} className="w-full">S'inscrire comme Pet-Sitter</Button>
            </form>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
