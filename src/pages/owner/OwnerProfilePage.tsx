import { useState } from 'react'
import { Save, User, IdCard, Upload } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { formatHumanAge, formatDate } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadOwnerIdentityDocFile } from '@/lib/supabase/uploads'

function fileLabel(path?: string) {
  if (!path) return 'Aucun fichier'
  const name = path.split('/').pop() || path
  return name.length > 40 ? `${name.slice(0, 37)}…` : name
}

export default function OwnerProfilePage() {
  const { t } = useI18n()
  const { currentUser, updateOwnerProfile } = useApp()
  const [form, setForm] = useState({
    firstName: currentUser?.firstName ?? '',
    lastName: currentUser?.lastName ?? '',
    phone: currentUser?.phone ?? '',
    address: currentUser?.address ?? '',
    birthDate: currentUser?.birthDate ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'idDocument' | 'proofOfAddress' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Le prénom et le nom sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)
    const err = await updateOwnerProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      birthDate: form.birthDate || undefined,
    })
    setSaving(false)
    if (err) {
      setError(
        err.includes('address') && err.includes('schema cache')
          ? 'La base de données doit être mise à jour. Dans Supabase → SQL Editor, exécutez la migration 014_owner_profile_identity.sql, puis réessayez.'
          : err,
      )
      return
    }
    setSuccess(true)
  }

  const handleDocUpload = (field: 'idDocument' | 'proofOfAddress', kind: 'id' | 'address') =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !currentUser) return
      setError('')
      setSuccess(false)
      if (!isSupabaseConfigured()) {
        await updateOwnerProfile({ [field]: file.name, identityVerified: false })
        e.target.value = ''
        return
      }
      setUploading(field)
      const { path, error: uploadError } = await uploadOwnerIdentityDocFile(currentUser.id, kind, file)
      setUploading(null)
      if (path) {
        const err = await updateOwnerProfile({ [field]: path, identityVerified: false })
        if (err) setError(err)
        else setSuccess(true)
      } else {
        setError(uploadError || 'Échec de l’envoi du document.')
      }
      e.target.value = ''
    }

  return (
    <DashboardLayout variant="owner" title={t('ownerProfile.title')}>
      <div className="max-w-2xl space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
              <IdCard className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('ownerProfile.heading')}</h2>
              <p className="text-sm text-slate-500">
                Ces informations sont consultables par l&apos;équipe SécurPats en cas de besoin.
              </p>
              {currentUser?.identityVerified ? (
                <span className="inline-block mt-1 text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  Identité validée
                </span>
              ) : (
                <span className="inline-block mt-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  En attente de validation
                </span>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {success && <p className="text-sm text-brand-600 mb-4">{t('ownerProfile.saved')}</p>}

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                required
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
              />
              <Input
                label="Nom"
                required
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <Input label="Email" value={currentUser?.email ?? ''} disabled />
            <Input
              label="Téléphone"
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <Textarea
              label="Adresse"
              rows={3}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Numéro, rue, code postal, ville"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Date de naissance"
                type="date"
                value={form.birthDate}
                onChange={e => setForm({ ...form, birthDate: e.target.value })}
              />
              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-slate-700">Âge</span>
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                  {formatHumanAge(form.birthDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button icon={Save} onClick={() => void handleSave()} disabled={saving}>
              {saving ? t('commonApp.saving') : t('commonApp.save')}
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-1">Documents obligatoires</h3>
          <p className="text-sm text-slate-500 mb-4">
            Pièce d’identité et justificatif de domicile — l’admin doit les valider avant l’accès au compte.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block rounded-xl border border-slate-200 p-4 space-y-2 cursor-pointer hover:border-brand-300">
              <span className="text-sm font-medium text-slate-800">Pièce d’identité *</span>
              <p className="text-xs text-slate-500">{fileLabel(currentUser?.idDocument)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading === 'idDocument' ? 'Envoi…' : 'Déposer / remplacer'}
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
                disabled={uploading === 'idDocument'}
                onChange={e => void handleDocUpload('idDocument', 'id')(e)}
              />
            </label>
            <label className="block rounded-xl border border-slate-200 p-4 space-y-2 cursor-pointer hover:border-brand-300">
              <span className="text-sm font-medium text-slate-800">Justificatif de domicile *</span>
              <p className="text-xs text-slate-500">{fileLabel(currentUser?.proofOfAddress)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading === 'proofOfAddress' ? 'Envoi…' : 'Déposer / remplacer'}
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf"
                disabled={uploading === 'proofOfAddress'}
                onChange={e => void handleDocUpload('proofOfAddress', 'address')(e)}
              />
            </label>
          </div>
        </Card>

        <Card padding="lg" className="bg-slate-50 border-slate-100">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">{t('ownerProfile.preview')}</p>
              <p>{form.firstName} {form.lastName}</p>
              <p>{form.phone || '—'}</p>
              <p className="whitespace-pre-line">{form.address || '—'}</p>
              <p>
                {form.birthDate ? `${formatDate(form.birthDate)} — ${formatHumanAge(form.birthDate)}` : t('ownerProfile.noDob')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
