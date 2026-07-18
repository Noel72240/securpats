import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Search, Phone, Mail, MapPin, Clock, Calendar,
  AlertTriangle, User, ArrowLeft,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { fetchVerifiedPetsitters } from '@/lib/petsitter/directory'
import type { DirectoryPetsitter } from '@/lib/petsitter/directory-types'
import { departmentLabel, departmentSelectOptions } from '@/lib/geo/french-departments'
import { useI18n } from '@/i18n/LanguageContext'

export default function FindPetsitterPage() {
  const { t, locale } = useI18n()
  const [sitters, setSitters] = useState<DirectoryPetsitter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError('')
      const { sitters: list, error: err } = await fetchVerifiedPetsitters(department || undefined)
      if (cancelled) return
      if (err) setError(err)
      setSitters(list)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [department])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sitters
    return sitters.filter(s => {
      const deptName = departmentLabel(s.departmentCode, locale)
      const hay = [
        s.firstName, s.lastName, s.email, s.phone, s.address,
        s.serviceArea, s.bio, s.availableHours, deptName, s.departmentCode,
        ...(s.availableDays || []),
      ].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [sitters, query, locale])

  const departmentOptions = useMemo(
    () => departmentSelectOptions(locale, t('ownerFind.allDepartments')),
    [locale, t],
  )

  return (
    <DashboardLayout variant="owner" title={t('ownerFind.title')}>
      <div className="max-w-3xl space-y-6">
        <Card className="!p-5 border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">{t('ownerFind.header')}</h2>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                {t('ownerFind.headerDesc')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/app/urgence">
                  <Button size="sm" className="!bg-red-600 hover:!bg-red-700" icon={AlertTriangle}>
                    {t('ownerFind.declare')}
                  </Button>
                </Link>
                <Link to="/app">
                  <Button size="sm" variant="outline" icon={ArrowLeft}>{t('ownerFind.dashboard')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-3">
          <Select
            label={t('ownerFind.department')}
            value={department}
            onChange={e => setDepartment(e.target.value)}
            options={departmentOptions}
          />
          <div className="relative sm:pt-[1.625rem]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 sm:top-[calc(50%+0.8125rem)] -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('ownerFind.search')}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm bg-white shadow-sm"
              aria-label={t('ownerFind.search')}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">{t('ownerFind.loading')}</p>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={Shield}
              title={t('ownerFind.emptyTitle')}
              description={
                query || department
                  ? t('ownerFind.emptyFiltered')
                  : t('ownerFind.emptyNone')
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {filtered.length > 1
                ? t('ownerFind.countPlural', { n: filtered.length })
                : t('ownerFind.count', { n: filtered.length })}
            </p>
            {filtered.map(s => {
              const name = `${s.firstName} ${s.lastName}`.trim() || 'Pet-sitter'
              const deptName = departmentLabel(s.departmentCode, locale)
              return (
                <Card key={s.userId} className="!p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-7 h-7 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{name}</h3>
                        <Badge variant="success">{t('ownerFind.verified')}</Badge>
                      </div>
                      {deptName && (
                        <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {deptName}
                        </p>
                      )}
                      {s.serviceArea && (
                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {s.serviceArea}
                        </p>
                      )}
                      {s.bio && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-3">{s.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    {s.availableDays.length > 0 && (
                      <p className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{s.availableDays.join(', ')}</span>
                      </p>
                    )}
                    {s.availableHours && (
                      <p className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{s.availableHours}</span>
                      </p>
                    )}
                    {s.address && (
                      <p className="flex items-start gap-2 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{s.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {s.phone ? (
                      <a href={`tel:${s.phone.replace(/\s/g, '')}`}>
                        <Button size="sm" className="!bg-red-600 hover:!bg-red-700" icon={Phone}>
                          {t('ownerFind.call')} {s.phone}
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" disabled icon={Phone}>{t('ownerFind.noPhone')}</Button>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}?subject=${encodeURIComponent('Urgence SécurPats — besoin d’un pet-sitter')}`}>
                        <Button size="sm" variant="outline" icon={Mail}>
                          {t('ownerFind.email')}
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
