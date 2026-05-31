import { Download, Trash2, Shield, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'

export default function PrivacyDataPage() {
  const { exportUserData, deleteAccount, currentUser } = useApp()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleExport = () => {
    const data = exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `securpats-donnees-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (confirmText !== 'SUPPRIMER') return
    setDeleting(true)
    setError('')
    const ok = await deleteAccount()
    setDeleting(false)
    if (ok) {
      navigate('/', { replace: true })
    } else {
      setError('La suppression a échoué. Contactez le DPO si le problème persiste.')
    }
  }

  return (
    <DashboardLayout variant="owner" title="Mes données personnelles">
      <div className="max-w-2xl space-y-6">
        <Card padding="lg">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-slate-900">Vos droits RGPD</h2>
              <p className="text-sm text-slate-600 mt-1">
                Conformément au Règlement (UE) 2016/679, vous pouvez accéder, exporter et supprimer vos données personnelles.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Compte : <strong>{currentUser?.email}</strong>
          </p>
          <ul className="text-sm text-slate-600 space-y-2 mb-6 list-disc pl-5">
            <li>Droit d&apos;accès et de portabilité (export JSON)</li>
            <li>Droit de rectification (modifiez vos informations dans l&apos;application)</li>
            <li>Droit à l&apos;effacement (suppression du compte ci-dessous)</li>
            <li>Droit de réclamation auprès de la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">CNIL</a></li>
          </ul>
          <p className="text-xs text-slate-500">
            Voir aussi : <Link to="/confidentialite" className="text-brand-600 hover:underline">Politique de confidentialité</Link>
            {' · '}
            <Link to="/rgpd" className="text-brand-600 hover:underline">Informations RGPD</Link>
          </p>
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold text-slate-900 mb-2">Exporter mes données</h3>
          <p className="text-sm text-slate-600 mb-4">
            Téléchargez une copie de vos données (profil, animaux, référents, documents, abonnement) au format JSON.
          </p>
          <Button icon={Download} onClick={handleExport}>Télécharger l&apos;export JSON</Button>
        </Card>

        <Card padding="lg" className="border-red-100">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700">Supprimer mon compte</h3>
              <p className="text-sm text-slate-600 mt-1">
                Action irréversible. Toutes vos données (animaux, référents, documents, abonnement) seront définitivement supprimées.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Tapez <strong>SUPPRIMER</strong> pour confirmer :
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-200"
            placeholder="SUPPRIMER"
          />
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <Button
            variant="danger"
            icon={Trash2}
            disabled={confirmText !== 'SUPPRIMER' || deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Suppression...' : 'Supprimer définitivement mon compte'}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
