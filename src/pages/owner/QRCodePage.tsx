import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check, QrCode, CreditCard } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useApp, useOwnerPets } from '@/contexts/AppContext'
import { getRescueUrl, getOwnerRescueUrl } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'

export default function QRCodePage() {
  const { t } = useI18n()
  const { currentUser } = useApp()
  const pets = useOwnerPets()
  const [selectedId, setSelectedId] = useState(pets[0]?.id || '')
  const [copied, setCopied] = useState<'owner' | 'pet' | null>(null)

  const pet = pets.find(p => p.id === selectedId)
  const ownerUrl = currentUser?.qrToken ? getOwnerRescueUrl(currentUser.qrToken) : ''
  const petUrl = pet ? getRescueUrl(pet.qrToken) : ''

  const copyUrl = (kind: 'owner' | 'pet', url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadOwnerPNG = () => {
    const svg = document.getElementById('qr-owner-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      ctx?.drawImage(img, 0, 0, 512, 512)
      const a = document.createElement('a')
      a.download = `qr-foyer-${currentUser?.lastName || 'securpats'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (!currentUser?.qrToken && pets.length === 0) {
    return (
      <DashboardLayout variant="owner" title={t('ownerQr.title')}>
        <Card><EmptyState icon={QrCode} title={t('ownerQr.unavailable')} description="Votre QR foyer sera généré à la connexion." /></Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="owner" title={t('ownerQr.title')}>
      <div className="max-w-2xl mx-auto space-y-8">
        {ownerUrl && (
          <section className="space-y-4">
            <div>
              <h2 className="font-bold text-slate-900">{t('ownerQr.household')}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Un seul QR pour {currentUser?.firstName} {currentUser?.lastName} — animaux et référents inclus.
              </p>
            </div>
            <Card padding="lg" className="text-center">
              <div className="inline-block p-6 bg-white rounded-2xl border-2 border-brand-100 shadow-sm">
                <QRCodeSVG id="qr-owner-svg" value={ownerUrl} size={200} level="H" includeMargin />
              </div>
              <p className="mt-4 font-semibold text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-xs text-brand-600 mt-2">Ouvre la fiche famille complète (sans connexion).</p>
            </Card>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button icon={Download} onClick={downloadOwnerPNG}>{t('ownerQr.downloadPng')}</Button>
              <Button variant="secondary" icon={copied === 'owner' ? Check : Copy} onClick={() => copyUrl('owner', ownerUrl)}>
                {copied === 'owner' ? t('ownerQr.copied') : t('ownerQr.copyUrl')}
              </Button>
              <Link to="/app/carte-urgence">
                <Button variant="outline" icon={CreditCard}>{t('ownerQr.printable')}</Button>
              </Link>
            </div>
          </section>
        )}

        {pets.length > 0 && (
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div>
              <h2 className="font-bold text-slate-900">{t('ownerQr.perPet')}</h2>
              <p className="text-sm text-slate-500 mt-1">Fiche de secours individuelle (optionnel).</p>
            </div>
            <Select
              label="Sélectionner un animal"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              options={pets.map(p => ({ value: p.id, label: p.name }))}
            />
            {pet && (
              <>
                <Card padding="lg" className="text-center">
                  <div className="inline-block p-6 bg-white rounded-2xl border border-slate-200">
                    <QRCodeSVG value={petUrl} size={160} level="H" includeMargin />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">{pet.name}</p>
                </Card>
                <div className="flex justify-center">
                  <Button variant="outline" icon={copied === 'pet' ? Check : Copy} onClick={() => copyUrl('pet', petUrl)}>
                    {copied === 'pet' ? t('ownerQr.copied') : t('ownerQr.copyPetUrl')}
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
