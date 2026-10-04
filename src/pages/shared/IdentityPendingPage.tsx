import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Clock, FileWarning } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FileUploadField } from '@/components/ui/FileUploadField'
import { useApp } from '@/contexts/AppContext'
import { homePathForRole } from '@/lib/caregiver/spaces'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  uploadOwnerIdentityDocFile,
  uploadPetSitterDocFile,
  uploadCaregiverDocFile,
} from '@/lib/supabase/uploads'
import { validatePetsitterIdFile } from '@/lib/petsitter/validation'

type Space = 'owner' | 'petsitter' | 'foster' | 'volunteer'

export default function IdentityPendingPage({
  variant,
  hasId,
  hasAddress,
  profilePath,
}: {
  variant: Space
  hasId: boolean
  hasAddress: boolean
  profilePath: string
}) {
  const { currentUser, logout, updateOwnerProfile, updatePetSitterProfile, updateCaregiverProfile } = useApp()
  const missingDocs = !hasId || !hasAddress
  const [idFile, setIdFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  const handleSubmitDocs = async () => {
    if (!currentUser) return
    setError('')
    setOkMsg('')

    const needId = !hasId
    const needAddress = !hasAddress
    if (needId && !idFile) {
      setError('Ajoutez votre pièce d’identité.')
      return
    }
    if (needAddress && !proofFile) {
      setError('Ajoutez votre justificatif de domicile.')
      return
    }

    if (idFile) {
      const idErr = validatePetsitterIdFile(idFile)
      if (idErr) {
        setError(idErr)
        return
      }
    }
    if (proofFile) {
      const proofErr = validatePetsitterIdFile(proofFile)
      if (proofErr) {
        setError(`Justificatif : ${proofErr}`)
        return
      }
    }

    setBusy(true)
    try {
      let idPath: string | undefined
      let addrPath: string | undefined

      if (isSupabaseConfigured()) {
        if (idFile) {
          const up =
            variant === 'owner'
              ? await uploadOwnerIdentityDocFile(currentUser.id, 'id', idFile)
              : variant === 'petsitter'
                ? await uploadPetSitterDocFile(currentUser.id, 'id', idFile)
                : await uploadCaregiverDocFile(currentUser.id, 'id', idFile)
          if (!up.path) {
            setError(up.error || 'Échec envoi pièce d’identité')
            return
          }
          idPath = up.path
        }
        if (proofFile) {
          const up =
            variant === 'owner'
              ? await uploadOwnerIdentityDocFile(currentUser.id, 'address', proofFile)
              : variant === 'petsitter'
                ? await uploadPetSitterDocFile(currentUser.id, 'address', proofFile)
                : await uploadCaregiverDocFile(currentUser.id, 'address', proofFile)
          if (!up.path) {
            setError(up.error || 'Échec envoi justificatif de domicile')
            return
          }
          addrPath = up.path
        }
      } else {
        idPath = idFile?.name
        addrPath = proofFile?.name
      }

      if (variant === 'owner') {
        const err = await updateOwnerProfile({
          ...(idPath ? { idDocument: idPath } : {}),
          ...(addrPath ? { proofOfAddress: addrPath } : {}),
          identityVerified: false,
        })
        if (err) {
          setError(err)
          return
        }
      } else if (variant === 'petsitter') {
        const err = await updatePetSitterProfile({
          ...(idPath ? { idDocument: idPath } : {}),
          ...(addrPath ? { proofOfAddress: addrPath } : {}),
          verified: false,
        })
        if (err) {
          setError(err)
          return
        }
      } else {
        const err = await updateCaregiverProfile({
          ...(idPath ? { idDocument: idPath } : {}),
          ...(addrPath ? { proofOfAddress: addrPath } : {}),
          verified: false,
        })
        if (err) {
          setError(err)
          return
        }
      }

      setIdFile(null)
      setProofFile(null)
      setOkMsg('Documents envoyés. Un administrateur va les vérifier.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout variant={variant} title="Validation du compte">
      <div className="max-w-lg mx-auto py-8">
        <Card className="!p-8 text-center space-y-4 border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 items-center justify-center mx-auto">
            {missingDocs ? <FileWarning className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {missingDocs ? 'Documents manquants' : 'Compte en cours de validation'}
          </h1>
          <p className="text-sm text-slate-600">
            {missingDocs
              ? 'Les fichiers n’ont pas été enregistrés sur votre compte. Déposez-les ici (photo ou PDF).'
              : 'Vos documents ont bien été reçus. Un administrateur SécurPats doit les valider avant de vous donner accès à l’espace.'}
          </p>
          <ul className="text-sm text-left space-y-2 bg-white rounded-xl border border-slate-100 p-4">
            <li className={hasId ? 'text-teal-700' : 'text-amber-800'}>
              {hasId ? '✓' : '○'} Pièce d’identité {hasId ? 'reçue' : 'manquante'}
            </li>
            <li className={hasAddress ? 'text-teal-700' : 'text-amber-800'}>
              {hasAddress ? '✓' : '○'} Justificatif de domicile {hasAddress ? 'reçu' : 'manquant'}
            </li>
            <li className="text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              Accès ouvert uniquement après validation admin des deux documents.
            </li>
          </ul>

          {missingDocs && (
            <div className="text-left space-y-4 bg-white rounded-xl border border-slate-200 p-4">
              {!hasId && (
                <FileUploadField
                  label="Pièce d’identité"
                  required
                  file={idFile}
                  onChange={setIdFile}
                />
              )}
              {!hasAddress && (
                <FileUploadField
                  label="Justificatif de domicile"
                  required
                  file={proofFile}
                  onChange={setProofFile}
                />
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {okMsg && <p className="text-sm text-teal-700">{okMsg}</p>}
              <Button className="w-full" loading={busy} onClick={() => void handleSubmitDocs()}>
                Envoyer mes documents
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Link to={profilePath}>
              <Button variant={missingDocs ? 'outline' : 'primary'}>
                {missingDocs ? 'Ouvrir mon profil' : 'Voir mon profil'}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                void logout()
                window.location.href = '/'
              }}
            >
              Déconnexion
            </Button>
          </div>
          {currentUser?.email && (
            <p className="text-xs text-slate-400">Connecté : {currentUser.email}</p>
          )}
          <p className="text-xs text-slate-400">
            Une fois validé, reconnectez-vous ou rechargez la page pour accéder à{' '}
            {homePathForRole(currentUser?.role || 'owner')}.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
