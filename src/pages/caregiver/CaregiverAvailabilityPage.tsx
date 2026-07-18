import { useState } from 'react'
import { Calendar, MapPin, Clock, Save } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'
import { departmentSelectOptions } from '@/lib/geo/french-departments'
import type { CaregiverKind } from '@/types'

const DAYS = [
  { storage: 'Lundi', key: 'petsitterAvail.mon' },
  { storage: 'Mardi', key: 'petsitterAvail.tue' },
  { storage: 'Mercredi', key: 'petsitterAvail.wed' },
  { storage: 'Jeudi', key: 'petsitterAvail.thu' },
  { storage: 'Vendredi', key: 'petsitterAvail.fri' },
  { storage: 'Samedi', key: 'petsitterAvail.sat' },
  { storage: 'Dimanche', key: 'petsitterAvail.sun' },
] as const satisfies ReadonlyArray<{ storage: string; key: TranslationKey }>

export default function CaregiverAvailabilityPage({ kind }: { kind: CaregiverKind }) {
  const { caregiverProfile, updateCaregiverProfile } = useApp()
  const { t, locale } = useI18n()
  const variant = kind === 'foster_family' ? 'foster' : 'volunteer'
  const [days, setDays] = useState<string[]>(caregiverProfile?.availableDays || [])
  const [hours, setHours] = useState(caregiverProfile?.availableHours || '')
  const [area, setArea] = useState(caregiverProfile?.serviceArea || '')
  const [departmentCode, setDepartmentCode] = useState(caregiverProfile?.departmentCode || '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const toggleDay = (day: string) => {
    setDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]))
  }

  const handleSave = () => {
    if (!departmentCode) {
      setError('Veuillez sélectionner votre département.')
      return
    }
    setError('')
    void updateCaregiverProfile({
      availableDays: days,
      availableHours: hours,
      serviceArea: area,
      departmentCode,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout variant={variant} title={t('petsitterAvail.title')}>
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">{t('petsitterAvail.days')}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day.storage}
                type="button"
                onClick={() => toggleDay(day.storage)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${days.includes(day.storage) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t(day.key)}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">{t('petsitterAvail.hours')}</h3>
          </div>
          <Input label={t('petsitterAvail.timeRange')} placeholder="Ex: 8h - 20h" value={hours} onChange={e => setHours(e.target.value)} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">{t('petsitterAvail.zone')}</h3>
          </div>
          <div className="space-y-4">
            <Select
              label={t('petsitterAvail.department')}
              required
              value={departmentCode}
              onChange={e => setDepartmentCode(e.target.value)}
              options={departmentSelectOptions(locale, t('petsitterAvail.departmentHint'))}
            />
            <Input label={t('petsitterAvail.zoneHint')} placeholder="Ex: Paris et banlieue" value={area} onChange={e => setArea(e.target.value)} />
          </div>
        </Card>

        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <Button icon={Save} onClick={handleSave}>
          {saved ? t('commonApp.saved') : t('commonApp.save')}
        </Button>
      </div>
    </DashboardLayout>
  )
}
