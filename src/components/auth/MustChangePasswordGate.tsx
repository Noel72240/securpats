import { useState } from 'react'
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { changeOwnPassword } from '@/lib/auth/password-reset'

/** Bloque l’app tant que l’utilisateur connecté avec un MDP provisoire n’a pas changé son mot de passe. */
export function MustChangePasswordGate({ children }: { children: React.ReactNode }) {
  const { currentUser, clearMustChangePassword } = useApp()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!currentUser?.mustChangePassword) {
    return <>{children}</>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    const err = await changeOwnPassword(password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    clearMustChangePassword()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Changement de mot de passe obligatoire</h2>
            <p className="text-sm text-slate-500 mt-1">
              Vous êtes connecté avec un mot de passe provisoire. Choisissez un nouveau mot de passe
              pour continuer.
            </p>
          </div>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <Input
            label="Nouveau mot de passe"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <Button type="submit" icon={loading ? Loader2 : KeyRound} className="w-full" disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer et continuer'}
          </Button>
        </form>
      </div>
    </div>
  )
}
