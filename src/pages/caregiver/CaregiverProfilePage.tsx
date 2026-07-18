import { useEffect, useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { departmentSelectOptions } from '@/lib/geo/french-departments'
import type { CaregiverKind } from '@/types'

export default function CaregiverProfilePage({ kind }: { kind: CaregiverKind }) {
  const { caregiverProfile, updateCaregiverProfile } = useApp()
  const { t, locale } = useI18n()
  const variant = kind === 'foster_family' ? 'foster' : 'volunteer'
  const prefix = kind === 'foster_family' ? 'fosterProfile' : 'volunteerProfile'

  const [form, setForm] = useState({
    bio: '',
    phone: '',
    email: '',
    address: '',
    departmentCode: '',
  })
  const [saving, setSaving] = useState(false)
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
    const err = await updateCaregiverProfile(form)
    setSaving(false)
    if (err) setError(err)
    else setSuccess(t('commonApp.saved'))
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
          <Button icon={Save} loading={saving} onClick={() => void handleSave()}>
            {t(`${prefix}.save` as 'fosterProfile.save')}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
