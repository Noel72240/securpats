import { useEffect, useState } from 'react'
import { Upload, Save, User, KeyRound, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadAvatarFile, uploadPetSitterDocFile } from '@/lib/supabase/uploads'
import { changeOwnPassword } from '@/lib/auth/password-reset'
import { departmentSelectOptions } from '@/lib/geo/french-departments'

function fileLabel(path?: string) {
  if (!path) return 'Cliquez pour uploader'
  return path.split('/').pop() || path
}

function scrollPageTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const main = document.querySelector('main')
  if (main instanceof HTMLElement) main.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function PetSitterProfilePage() {
  const { t, locale } = useI18n()
  const { currentUser, petSitterProfile, updatePetSitterProfile, clearMustChangePassword } = useApp()
  const [form, setForm] = useState({
    bio: '',
    phone: '',
    email: '',
    address: '',
    departmentCode: '',
    photo: '',
  })
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [pwd, setPwd] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  // Synchroniser quand le profil arrive (hydratation async)
  useEffect(() => {
    if (!petSitterProfile) return
    setForm({
      bio: petSitterProfile.bio || '',
      phone: petSitterProfile.phone || '',
      email: petSitterProfile.email || '',
      address: petSitterProfile.address || '',
      departmentCode: petSitterProfile.departmentCode || '',
      photo: petSitterProfile.photo || '',
    })
  }, [petSitterProfile])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (!form.departmentCode) {
        setError('Veuillez sélectionner votre département d’intervention.')
        setSaving(false)
        return
      }
      const err = await updatePetSitterProfile(form)
      if (err) {
        setError(err)
        return
      }
      setSuccess(t('commonApp.saved'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur d’enregistrement')
    } finally {
      setSaving(false)
      scrollPageTop()
    }
  }

  const handleChangePassword = async () => {
    setPwdError('')
    setPwdSuccess('')
    if (pwd.length < 8) {
      setPwdError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (pwd !== pwdConfirm) {
      setPwdError('Les mots de passe ne correspondent pas.')
      return
    }
    setPwdSaving(true)
    try {
      const err = await changeOwnPassword(pwd)
      if (err) {
        setPwdError(err)
        return
      }
      clearMustChangePassword()
      setPwd('')
      setPwdConfirm('')
      setPwdSuccess(t('petsitterProfile.passwordChanged'))
      setSuccess(t('commonApp.saved'))
      scrollPageTop()
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Erreur changement de mot de passe')
    } finally {
      setPwdSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    if (!isSupabaseConfigured()) {
      setForm(f => ({ ...f, photo: file.name }))
      e.target.value = ''
      return
    }
    setUploading('photo')
    const { publicUrl, error: uploadError } = await uploadAvatarFile(currentUser.id, file)
    setUploading(null)
    if (publicUrl) setForm(f => ({ ...f, photo: publicUrl }))
    else setError(uploadError || 'Échec upload photo')
    e.target.value = ''
  }

  const handleFileUpload = (field: 'idDocument' | 'proofOfAddress', kind: 'id' | 'address') =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !currentUser) return
      if (!isSupabaseConfigured()) {
        await updatePetSitterProfile({ [field]: file.name })
        e.target.value = ''
        return
      }
      setUploading(field)
      const { path, error: uploadError } = await uploadPetSitterDocFile(currentUser.id, kind, file)
      setUploading(null)
      if (path) {
        const err = await updatePetSitterProfile({ [field]: path })
        if (err) setError(err)
        else setSuccess(t('petsitterProfile.docSaved'))
      } else {
        setError(uploadError || 'Échec upload document')
      }
      e.target.value = ''
    }

  return (
    <DashboardLayout variant="petsitter" title={t('petsitterProfile.title')}>
      <div className="max-w-2xl space-y-6">
        {success && (
          <div className="sticky top-2 z-20 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card padding="lg">
          <div className="flex items-center gap-4 mb-6">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('petsitterProfile.heading')}</h2>
              {petSitterProfile?.verified && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  ✓ {t('petsitterProfile.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Input label="URL Photo" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} />
            {isSupabaseConfigured() && (
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">Photo (upload Supabase)</span>
                <input type="file" accept="image/*" onChange={e => void handlePhotoUpload(e)} disabled={uploading === 'photo'} className="text-sm" />
              </label>
            )}
            <Textarea label="Présentation" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Adresse" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Select
              label={t('petsitterProfile.department')}
              required
              value={form.departmentCode}
              onChange={e => setForm({ ...form, departmentCode: e.target.value })}
              options={departmentSelectOptions(locale, t('petsitterProfile.departmentHint'))}
            />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button icon={Save} loading={saving} onClick={() => void handleSave()}>
              {t('petsitterProfile.saveProfile')}
            </Button>
            {success && (
              <p className="text-sm font-semibold text-brand-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </p>
            )}
          </div>
        </Card>

        <Card padding="lg" className="space-y-4 border-2 border-blue-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">{t('petsitterProfile.passwordSection')}</h3>
          </div>
          <p className="text-xs text-slate-500">
            Minimum 8 caractères. Si ça échoue, déconnectez-vous, reconnectez-vous, puis changez-le tout de suite.
          </p>
          {pwdSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">
              <CheckCircle2 className="w-4 h-4" />
              {pwdSuccess}
            </div>
          )}
          {pwdError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {pwdError}
            </div>
          )}
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirmer"
            type="password"
            value={pwdConfirm}
            onChange={e => setPwdConfirm(e.target.value)}
            autoComplete="new-password"
          />
          <Button
            variant="outline"
            icon={KeyRound}
            loading={pwdSaving}
            disabled={!pwd || !pwdConfirm || pwdSaving}
            onClick={() => void handleChangePassword()}
          >
            {t('petsitterProfile.changePassword')}
          </Button>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">{t('petsitterProfile.idDocs')}</h3>
          <p className="text-xs text-slate-500 mb-4">
            La pièce d&apos;identité est obligatoire. Sans elle, l&apos;accès à l&apos;espace pet-sitter est bloqué.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => void handleFileUpload('idDocument', 'id')(e)} disabled={uploading === 'idDocument'} />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">{t('petsitterProfile.idDoc')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {uploading === 'idDocument' ? t('petsitterProfile.uploading') : fileLabel(petSitterProfile?.idDocument)}
                </p>
              </div>
            </label>
            <label className="block">
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => void handleFileUpload('proofOfAddress', 'address')(e)} disabled={uploading === 'proofOfAddress'} />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">{t('petsitterProfile.proof')}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {uploading === 'proofOfAddress' ? t('petsitterProfile.uploading') : fileLabel(petSitterProfile?.proofOfAddress)}
                </p>
              </div>
            </label>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
