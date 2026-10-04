import { useEffect, useState } from 'react'
import { Save, CheckCircle2, Upload } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { departmentSelectOptions } from '@/lib/geo/french-departments'
import { emptyQuestionnaire } from '@/lib/caregiver/form'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadCaregiverDocFile } from '@/lib/supabase/uploads'
import type { CaregiverKind } from '@/types'

function fileLabel(path?: string) {
  if (!path) return 'Aucun fichier'
  const name = path.split('/').pop() || path
  return name.length > 40 ? `${name.slice(0, 37)}…` : name
}

export default function CaregiverProfilePage({ kind: kindProp }: { kind?: CaregiverKind } = {}) {
  const { caregiverProfile, updateCaregiverProfile, currentUser } = useApp()
  const { t, locale } = useI18n()
  const kind: CaregiverKind = kindProp
    || caregiverProfile?.kind
    || (currentUser?.role === 'volunteer' ? 'volunteer' : 'foster_family')
  const variant = kind === 'volunteer' ? 'volunteer' : 'foster'
  const prefix = kind === 'volunteer' ? 'volunteerProfile' : 'fosterProfile'

  const [form, setForm] = useState({
    bio: '',
    phone: '',
    email: '',
    address: '',
    departmentCode: '',
  })
  const [hasAcaced, setHasAcaced] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'idDocument' | 'proofOfAddress' | 'criminalRecord' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!caregiverProfile) return
    setForm({
      bio: caregiverProfile.bio || '',
      phone: caregiverProfile.phone || '',
      email: caregiverProfile.email || '',
      address: caregiverProfile.address || '',
      departmentCode: caregiverProfile.departmentCode || '',
    })
    setHasAcaced(caregiverProfile.questionnaire?.hasAcaced ?? null)
  }, [caregiverProfile])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    if (!form.departmentCode) {
      setError(t(`${prefix}.needDepartment` as 'fosterProfile.needDepartment'))
      setSaving(false)
      return
    }
    const err = await updateCaregiverProfile({
      ...form,
      questionnaire: {
        ...(caregiverProfile?.questionnaire || emptyQuestionnaire()),
        hasAcaced,
      },
    })
    setSaving(false)
    if (err) setError(err)
    else setSuccess(t('commonApp.saved'))
  }

  const handleDocUpload = (field: 'idDocument' | 'proofOfAddress' | 'criminalRecord', kindDoc: 'id' | 'address' | 'criminal') =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !currentUser) return
      setError('')
      setSuccess('')
      if (!isSupabaseConfigured()) {
        await updateCaregiverProfile({ [field]: file.name, ...(field === 'criminalRecord' ? {} : { verified: false }) })
        e.target.value = ''
        return
      }
      setUploading(field)
      const { path, error: uploadError } = await uploadCaregiverDocFile(currentUser.id, kindDoc, file)
      setUploading(null)
      if (path) {
        const patch =
          field === 'criminalRecord'
            ? { criminalRecord: path }
            : { [field]: path, verified: false as const }
        const err = await updateCaregiverProfile(patch)
        if (err) setError(err)
        else setSuccess('Document enregistré.')
      } else {
        setError(uploadError || 'Échec de l’envoi du document.')
      }
      e.target.value = ''
    }

  return (
    <DashboardLayout variant={variant} title={t(`${prefix}.title` as 'fosterProfile.title')}>
      <div className="max-w-2xl space-y-6">
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
            <CheckCircle2 className="w-5 h-5" /> {success}
          </div>
        )}
        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Card padding="lg" className="space-y-4">
          <Textarea label={t(`${prefix}.bio` as 'fosterProfile.bio')} rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <Input label={t('common.phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label={t('common.email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label={t(`${prefix}.address` as 'fosterProfile.address')} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <Select
            label={t(`${prefix}.department` as 'fosterProfile.department')}
            required
            value={form.departmentCode}
            onChange={e => setForm({ ...form, departmentCode: e.target.value })}
            options={departmentSelectOptions(locale, t(`${prefix}.departmentHint` as 'fosterProfile.departmentHint'))}
          />
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Disposez-vous de l’ACACED ?</p>
            <p className="text-xs text-slate-500 mb-2">Attestation de connaissances animaux de compagnie — facultatif</p>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={hasAcaced === true} onChange={() => setHasAcaced(true)} />
                Oui
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={hasAcaced === false} onChange={() => setHasAcaced(false)} />
                Non
              </label>
            </div>
          </div>
          <Button icon={Save} loading={saving} onClick={() => void handleSave()}>
            {t(`${prefix}.save` as 'fosterProfile.save')}
          </Button>
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-1">Documents obligatoires</h3>
          <p className="text-sm text-slate-500 mb-4">
            Pièce d’identité et justificatif de domicile — validation admin requise pour accéder à l’espace.
          </p>
          {caregiverProfile?.verified ? (
            <p className="text-xs font-semibold text-brand-600 mb-3">Identité validée</p>
          ) : (
            <p className="text-xs font-semibold text-amber-700 mb-3">En attente de validation</p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block rounded-xl border border-slate-200 p-4 space-y-2 cursor-pointer hover:border-brand-300">
              <span className="text-sm font-medium text-slate-800">Pièce d’identité *</span>
              <p className="text-xs text-slate-500">{fileLabel(caregiverProfile?.idDocument)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading === 'idDocument' ? 'Envoi…' : 'Déposer / remplacer'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={uploading === 'idDocument'}
                onChange={e => void handleDocUpload('idDocument', 'id')(e)}
              />
            </label>
            <label className="block rounded-xl border border-slate-200 p-4 space-y-2 cursor-pointer hover:border-brand-300">
              <span className="text-sm font-medium text-slate-800">Justificatif de domicile *</span>
              <p className="text-xs text-slate-500">{fileLabel(caregiverProfile?.proofOfAddress)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading === 'proofOfAddress' ? 'Envoi…' : 'Déposer / remplacer'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={uploading === 'proofOfAddress'}
                onChange={e => void handleDocUpload('proofOfAddress', 'address')(e)}
              />
            </label>
            <label className="block rounded-xl border border-slate-200 p-4 space-y-2 cursor-pointer hover:border-brand-300 sm:col-span-2">
              <span className="text-sm font-medium text-slate-800">Extrait de casier judiciaire (bulletin n°3)</span>
              <p className="text-xs text-slate-500">Recommandé — non obligatoire pour l’accès au compte</p>
              <p className="text-xs text-slate-500">{fileLabel(caregiverProfile?.criminalRecord)}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading === 'criminalRecord' ? 'Envoi…' : 'Déposer / remplacer'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={uploading === 'criminalRecord'}
                onChange={e => void handleDocUpload('criminalRecord', 'criminal')(e)}
              />
            </label>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
