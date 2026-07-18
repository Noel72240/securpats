import { Link } from 'react-router-dom'
import { Calendar, MapPin, Settings, Heart, HandHeart } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import { departmentLabel } from '@/lib/geo/french-departments'
import { CAREGIVER_SPACES } from '@/lib/caregiver/spaces'
import type { CaregiverKind } from '@/types'

export default function CaregiverDashboard({ kind }: { kind: CaregiverKind }) {
  const { currentUser, caregiverProfile } = useApp()
  const { t, locale } = useI18n()
  const space = CAREGIVER_SPACES[kind]
  const prefix = kind === 'foster_family' ? 'fosterDash' : 'volunteerDash'
  const Icon = kind === 'foster_family' ? Heart : HandHeart
  const variant = kind === 'foster_family' ? 'foster' : 'volunteer'

  return (
    <DashboardLayout variant={variant} title={t(`${prefix}.title` as 'fosterDash.title')}>
      <div className="max-w-3xl space-y-6">
        <Card className={`!p-6 border-2 ${kind === 'foster_family' ? 'border-teal-200 bg-gradient-to-br from-teal-50 to-white' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white ${kind === 'foster_family' ? 'bg-teal-600' : 'bg-amber-600'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t(`${prefix}.welcome` as 'fosterDash.welcome', { name: currentUser?.firstName || '' })}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{t(`${prefix}.intro` as 'fosterDash.intro')}</p>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="!p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="w-4 h-4 text-slate-400" />
              {t(`${prefix}.location` as 'fosterDash.location')}
            </div>
            <p className="text-sm text-slate-700">
              {departmentLabel(caregiverProfile?.departmentCode, locale) || t(`${prefix}.noDepartment` as 'fosterDash.noDepartment')}
            </p>
            {caregiverProfile?.serviceArea && (
              <p className="text-sm text-slate-500">{caregiverProfile.serviceArea}</p>
            )}
            <Link to={`${space.basePath}/disponibilites`}>
              <Button size="sm" variant="outline" icon={Calendar}>{t(`${prefix}.editAvail` as 'fosterDash.editAvail')}</Button>
            </Link>
          </Card>

          <Card className="!p-5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Settings className="w-4 h-4 text-slate-400" />
              {t(`${prefix}.profile` as 'fosterDash.profile')}
            </div>
            <p className="text-sm text-slate-600 line-clamp-3">
              {caregiverProfile?.bio || t(`${prefix}.noBio` as 'fosterDash.noBio')}
            </p>
            <Link to={`${space.basePath}/profil`}>
              <Button size="sm" variant="outline" icon={Settings}>{t(`${prefix}.editProfile` as 'fosterDash.editProfile')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
