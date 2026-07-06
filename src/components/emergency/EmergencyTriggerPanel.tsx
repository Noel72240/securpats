import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { triggerEmergencyFromQr, type TriggerEmergencyResult } from '@/lib/emergency/alert'

type Props = {
  tokenType: 'owner' | 'pet'
  token: string
  petQrToken?: string
  petName?: string
  referentsCount: number
  compact?: boolean
}

export function EmergencyTriggerPanel({
  tokenType,
  token,
  petQrToken,
  petName,
  referentsCount,
  compact = false,
}: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriggerEmergencyResult | null>(null)
  const [error, setError] = useState('')

  const handleTrigger = async () => {
    if (referentsCount === 0) {
      setError('Aucun référent enregistré pour ce foyer.')
      return
    }

    setLoading(true)
    setError('')
    const res = await triggerEmergencyFromQr({
      tokenType,
      token,
      petQrToken,
      description: description.trim() || `Urgence signalée${petName ? ` pour ${petName}` : ''}.`,
    })
    setLoading(false)

    if (!res.ok) {
      setError(res.error || 'Impossible de déclencher l\'alerte')
      return
    }
    setResult(res)
  }

  if (result?.ok) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <p className="font-bold text-lg">Alerte transmise</p>
            <p className="text-sm text-emerald-700 mt-1">
              Les {result.referentsCount} référent(s) ont reçu une demande de confirmation par email
              {(result.smsSent ?? 0) > 0 ? ' et SMS' : ''}.
            </p>
          </div>
        </div>
        <p className="text-sm text-emerald-900">
          Dès qu&apos;un référent confirme sa disponibilité, la procédure d&apos;urgence SécurPats sera activée
          et tous les contacts seront alertés.
        </p>
        {(result.emailsSent === 0 && result.smsSent === 0) && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Notifications automatiques non disponibles — appelez les référents listés ci-dessous.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-red-50 border-2 border-red-300 rounded-2xl ${compact ? 'p-4' : 'p-5'} space-y-4`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900 text-lg">Je confirme l&apos;urgence</p>
          <p className="text-sm text-red-800 mt-1">
            Pour un proche, un secouriste ou un tiers : déclenchez l&apos;alerte. Les référents seront contactés
            pour <strong>confirmer leur disponibilité</strong> avant le lancement de la procédure.
          </p>
        </div>
      </div>

      {!compact && (
        <Textarea
          label="Précisions (optionnel)"
          placeholder="Ex. : hospitalisation du propriétaire, animal seul à domicile..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <Button
        variant="danger"
        className="w-full"
        icon={loading ? Loader2 : Send}
        loading={loading}
        disabled={referentsCount === 0}
        onClick={handleTrigger}
      >
        Je confirme l&apos;urgence
      </Button>
    </div>
  )
}
