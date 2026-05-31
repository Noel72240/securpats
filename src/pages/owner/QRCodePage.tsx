import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check, QrCode } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useOwnerPets } from '@/contexts/AppContext'
import { getRescueUrl } from '@/lib/utils'

export default function QRCodePage() {
  const pets = useOwnerPets()
  const [selectedId, setSelectedId] = useState(pets[0]?.id || '')
  const [copied, setCopied] = useState(false)

  const pet = pets.find(p => p.id === selectedId)
  const url = pet ? getRescueUrl(pet.qrToken) : ''

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPNG = () => {
    const svg = document.getElementById('qr-code-svg')
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
      a.download = `qr-${pet?.name || 'animal'}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const downloadPDF = () => {
    alert('Export PDF simulé — sera connecté à une librairie PDF lors de l\'intégration.')
  }

  if (pets.length === 0) {
    return (
      <DashboardLayout variant="owner" title="QR Code d'urgence">
        <Card><EmptyState icon={QrCode} title="Aucun animal" description="Ajoutez un animal pour générer son QR Code." /></Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout variant="owner" title="QR Code d'urgence">
      <div className="max-w-2xl mx-auto space-y-6">
        <Select
          label="Sélectionner un animal"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          options={pets.map(p => ({ value: p.id, label: p.name }))}
        />

        {pet && (
          <>
            <Card padding="lg" className="text-center">
              <div className="inline-block p-6 bg-white rounded-2xl border-2 border-brand-100 shadow-sm">
                <QRCodeSVG id="qr-code-svg" value={url} size={200} level="H" includeMargin />
              </div>
              <p className="mt-4 font-semibold text-slate-900">{pet.name}</p>
              <p className="text-sm text-slate-500 mt-1 break-all">{url}</p>
            </Card>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button icon={Download} onClick={downloadPNG}>Télécharger PNG</Button>
              <Button variant="outline" icon={Download} onClick={downloadPDF}>Télécharger PDF</Button>
              <Button variant="secondary" icon={copied ? Check : Copy} onClick={copyUrl}>
                {copied ? 'Copié !' : 'Copier l\'URL'}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
