import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Loader2, PawPrint, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { confirmEmergency, fetchConfirmPreview, type ConfirmPreview } from '@/lib/emergency/alert'

export default function EmergencyConfirmPage() {
  const { token } = useParams()
  const [preview, setPreview] = useState<ConfirmPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const [confirmedBy, setConfirmedBy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchConfirmPreview(token).then(data => {
      setPreview(data)
      if (data?.alert_confirmed || data?.already_confirmed) {
        setDone(true)
        setConfirmedBy(data.confirmed_by || `${data.referent_first_name} ${data.referent_last_name}`.trim())
      }
      setLoading(false)
    })
  }, [token])

  const handleConfirm = async () => {
    if (!token) return
    setConfirming(true)
    setError('')
    const result = await confirmEmergency(token) as {
      ok?: boolean
      error?: string
      confirmedBy?: string
      alreadyConfirmed?: boolean
    }
    setConfirming(false)

    if (!result.ok) {
      setError(result.error || 'Confirmation impossible')
      return
    }

    setDone(true)
    setConfirmedBy(result.confirmedBy || '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Lien invalide</h1>
          <p className="text-slate-500 mt-2">Ce lien de confirmation n&apos;existe pas ou a expiré.</p>
        </div>
      </div>
    )
  }

  const referentName = `${preview.referent_first_name} ${preview.referent_last_name}`.trim()

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="bg-red-600 text-white py-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold">SÉCURPATS — CONFIRMATION RÉFÉRENT</p>
            <p className="text-sm text-red-100">Urgence animale</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">
              {preview.alert_confirmed && !preview.already_confirmed
                ? 'Procédure d\'urgence activée'
                : 'Confirmation enregistrée'}
            </h1>
            <p className="text-slate-600">
              {confirmedBy
                ? `${confirmedBy} a confirmé la prise en charge de ${preview.pet_name}.`
                : `Prise en charge confirmée pour ${preview.pet_name}.`}
            </p>
            <p className="text-sm text-slate-500">
              Tous les référents ont été alertés. Merci de contacter le propriétaire et le vétérinaire si nécessaire.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Bonjour {preview.referent_first_name},</p>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  Urgence pour {preview.pet_name}
                </h1>
              </div>
            </div>

            {preview.description && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-900">
                <p className="font-semibold mb-1">Situation signalée</p>
                <p>{preview.description}</p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              En confirmant, vous déclenchez la <strong>procédure d&apos;urgence SécurPats</strong> :
              tous les référents seront alertés et une mission sera créée pour organiser la prise en charge.
            </p>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
            )}

            <Button
              variant="danger"
              className="w-full"
              size="lg"
              icon={confirming ? Loader2 : CheckCircle}
              loading={confirming}
              onClick={handleConfirm}
            >
              Je confirme — je prends en charge
            </Button>

            <p className="text-xs text-slate-400 text-center">
              Référent : {referentName} · SécurPats
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
