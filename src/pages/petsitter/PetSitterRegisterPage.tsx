import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus, Upload, Loader2, Shield, IdCard, CheckCircle, AlertTriangle, Heart,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { PETSITTER_ID_LEGAL_NOTICE, validatePetsitterIdFile } from '@/lib/petsitter/validation'

function FileUploadBox({
  label,
  required,
  hint,
  file,
  onChange,
  disabled,
  error,
}: {
  label: string
  required?: boolean
  hint: string
  file: File | null
  onChange: (f: File | null) => void
  disabled?: boolean
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`w-full border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
          error ? 'border-red-300 bg-red-50/50' : file ? 'border-brand-400 bg-brand-50/40' : 'border-slate-200 hover:border-brand-300 bg-white'
        }`}
      >
        {file ? (
          <>
            <CheckCircle className="w-8 h-8 text-brand-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900 break-all">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(0)} Ko — Cliquez pour changer</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Cliquez pour envoyer</p>
            <p className="text-xs text-slate-500 mt-1">{hint}</p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
        onChange={e => {
          const f = e.target.files?.[0] ?? null
          onChange(f)
          e.target.value = ''
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}

export default function PetSitterRegisterPage() {
  const navigate = useNavigate()
  const { currentUser, petSitterProfile, registerPetsitter, completePetsitterIdentity } = useApp()

  const completionMode = Boolean(
    currentUser?.role === 'petsitter' && !petSitterProfile?.idDocument,
  )

  const [form, setForm] = useState({
    firstName: currentUser?.firstName ?? '',
    lastName: currentUser?.lastName ?? '',
    email: currentUser?.email ?? '',
    phone: currentUser?.phone ?? '',
    address: petSitterProfile?.address ?? '',
    bio: petSitterProfile?.bio ?? '',
    password: '',
    confirm: '',
  })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [idProcessingAccepted, setIdProcessingAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [idFileError, setIdFileError] = useState('')

  const handleIdFile = (f: File | null) => {
    setIdFile(f)
    setIdFileError(f ? validatePetsitterIdFile(f) ?? '' : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!idFile) {
      setIdFileError('La pièce d\'identité est obligatoire. Inscription refusée sans ce document.')
      setError('Vous devez joindre une pièce d\'identité valide pour vous inscrire comme pet-sitter.')
      return
    }
    const idErr = validatePetsitterIdFile(idFile)
    if (idErr) {
      setIdFileError(idErr)
      setError(idErr)
      return
    }

    if (!idProcessingAccepted) {
      setError('Vous devez accepter le traitement de votre pièce d\'identité (obligatoire).')
      return
    }

    setLoading(true)

    if (completionMode && currentUser) {
      const result = await completePetsitterIdentity({
        idFile,
        proofFile,
        address: form.address,
        bio: form.bio,
        idProcessingAccepted,
      })
      setLoading(false)
      if (result.error) {
        setError(result.error)
        return
      }
      navigate('/pet-sitter/abonnement')
      return
    }

    if (!termsAccepted || !privacyAccepted) {
      setLoading(false)
      setError('Vous devez accepter les CGU et la politique de confidentialité.')
      return
    }
    if (form.password !== form.confirm) {
      setLoading(false)
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setLoading(false)
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    const result = await registerPetsitter({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      address: form.address,
      bio: form.bio,
      idFile,
      proofFile,
      consent: { termsAccepted, privacyAccepted, idProcessingAccepted, marketingOptIn },
    })
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setSuccess(result.message ?? 'Compte créé. Vérifiez votre email pour continuer.')
      return
    }
    navigate('/pet-sitter/abonnement')
  }

  return (
    <PublicLayout>
      <section className="py-10 sm:py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
              <Heart className="w-3.5 h-3.5" />
              Abonnement VIP — 9,90 €/mois
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {completionMode ? 'Finaliser votre inscription Pet-Sitter' : 'Devenir Pet-Sitter VIP'}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
              {completionMode
                ? 'Dernière étape : envoyez votre pièce d\'identité, puis activez votre abonnement VIP (9,90 €/mois).'
                : 'Rejoignez le réseau SécurPats. Inscription gratuite, puis abonnement VIP à 9,90 €/mois pour accéder à l\'espace et recevoir des missions.'}
            </p>
          </div>

          {completionMode && (
            <Card className="mb-6 !p-4 bg-amber-50 border-amber-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">
                  Connecté en tant que <strong>{currentUser?.email}</strong>. Votre pièce d&apos;identité est
                  <strong> obligatoire</strong> pour accéder à l&apos;espace pet-sitter.
                </p>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!completionMode && (
              <Card padding="lg">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Vos coordonnées
                </h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Prénom" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    <Input label="Nom" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                  <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <Input label="Téléphone" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  <Input label="Adresse complète" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Numéro, rue, code postal, ville" />
                  <Textarea label="Présentation" required rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Votre expérience avec les animaux, votre zone d'intervention..." />
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <Input label="Mot de passe" type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <Input label="Confirmer le mot de passe" type="password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                  </div>
                </div>
              </Card>
            )}

            {completionMode && (
              <Card padding="lg" className="space-y-4">
                <Input label="Adresse" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                <Textarea label="Présentation" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </Card>
            )}

            <Card padding="lg">
              <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-600" />
                Carte d&apos;identité
                <span className="text-red-500 text-sm font-bold">Obligatoire</span>
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                CNI, passeport ou titre de séjour en cours de validité — recto verso si nécessaire (1 fichier PDF ou photo).
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <FileUploadBox
                  label="Pièce d'identité"
                  required
                  hint="JPG, PNG, WEBP ou PDF — max. 10 Mo"
                  file={idFile}
                  onChange={handleIdFile}
                  disabled={loading}
                  error={idFileError}
                />
                <FileUploadBox
                  label="Justificatif de domicile"
                  hint="Optionnel — facture, quittance..."
                  file={proofFile}
                  onChange={setProofFile}
                  disabled={loading}
                />
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed flex gap-2">
                  <Shield className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  {PETSITTER_ID_LEGAL_NOTICE}
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="font-semibold text-slate-900 mb-4">Consentements légaux</h2>
              <div className="space-y-3">
                {!completionMode && (
                  <>
                    <label className="flex items-start gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      <span>
                        J&apos;accepte les{' '}
                        <Link to="/cgu" target="_blank" className="text-brand-600 hover:underline">Conditions Générales d&apos;Utilisation</Link>{' '}
                        de SécurPats *
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-600">
                      <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      <span>
                        J&apos;accepte la{' '}
                        <Link to="/confidentialite" target="_blank" className="text-brand-600 hover:underline">politique de confidentialité</Link>{' '}
                        et le{' '}
                        <Link to="/rgpd" target="_blank" className="text-brand-600 hover:underline">traitement de mes données (RGPD)</Link> *
                      </span>
                    </label>
                  </>
                )}
                <label className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                  <input type="checkbox" checked={idProcessingAccepted} onChange={e => setIdProcessingAccepted(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span>
                    J&apos;accepte que ma pièce d&apos;identité soit collectée, stockée de manière sécurisée et traitée
                    uniquement pour la vérification de mon profil pet-sitter, conformément à la{' '}
                    <Link to="/confidentialite" target="_blank" className="text-brand-600 hover:underline">politique de confidentialité</Link>.
                    <strong className="text-red-600"> Sans ce consentement, l&apos;inscription sera refusée. *</strong>
                  </span>
                </label>
                {!completionMode && (
                  <label className="flex items-start gap-2 text-sm text-slate-500">
                    <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    <span>Recevoir des informations sur les missions et nouveautés SécurPats (optionnel)</span>
                  </label>
                )}
              </div>
            </Card>

            {success && (
              <Card className="!p-4 bg-brand-50 border-brand-200 text-sm text-brand-800 text-center">
                {success}
                <p className="mt-2">
                  <Link to="/pet-sitter/connexion" className="font-semibold underline">Aller à la connexion Pet-Sitter</Link>
                </p>
              </Card>
            )}
            {error && (
              <Card className="!p-4 bg-red-50 border-red-200 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </Card>
            )}

            <Button
              type="submit"
              icon={loading ? Loader2 : UserPlus}
              className="w-full"
              disabled={loading || !!success}
              size="lg"
            >
              {loading
                ? 'Envoi en cours...'
                : completionMode
                  ? 'Envoyer ma pièce d\'identité et accéder à mon espace'
                  : 'S\'inscrire comme Pet-Sitter'}
            </Button>

            {!completionMode && (
              <p className="text-center text-sm text-slate-500">
                Déjà inscrit ?{' '}
                <Link to="/pet-sitter/connexion" className="text-blue-600 font-semibold hover:underline">Connexion Pet-Sitter</Link>
              </p>
            )}
          </form>
        </div>
      </section>
    </PublicLayout>
  )
}
