import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

function parseAuthParams(): URLSearchParams {
  const fromSearch = new URLSearchParams(window.location.search)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const fromHash = new URLSearchParams(hash)
  // Priorité au hash (Supabase y met access_token / error)
  for (const [k, v] of fromSearch.entries()) {
    if (!fromHash.has(k)) fromHash.set(k, v)
  }
  return fromHash
}

/**
 * Gère les retours email Supabase (reset MDP) qui arrivent souvent sur `/#...`
 * au lieu de `/reinitialiser-mot-de-passe`.
 */
export function AuthHashHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = parseAuthParams()
    const error = params.get('error')
    const errorCode = params.get('error_code')
    const type = params.get('type')
    const accessToken = params.get('access_token')
    const hasAuthPayload = Boolean(error || type || accessToken || params.get('refresh_token'))

    if (!hasAuthPayload) return

    // Lien expiré / invalide
    if (error || errorCode === 'otp_expired') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      navigate('/mot-de-passe-oublie?reason=expired', { replace: true })
      return
    }

    // Recovery OK → page de nouveau mot de passe
    const isRecovery =
      type === 'recovery' ||
      (Boolean(accessToken) && (type === 'recovery' || !type))

    if (isRecovery || accessToken) {
      // Laisser Supabase consommer le hash (session recovery)
      if (isSupabaseConfigured()) {
        void getSupabase().auth.getSession().finally(() => {
          navigate('/reinitialiser-mot-de-passe', { replace: true })
        })
      } else {
        navigate('/reinitialiser-mot-de-passe', { replace: true })
      }
    }
  }, [navigate])

  return null
}
