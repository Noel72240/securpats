import { Navigate } from 'react-router-dom'
import HomePage from '@/pages/public/HomePage'
import MobileAppHomePage from '@/pages/mobile/MobileAppHomePage'
import { useApp } from '@/contexts/AppContext'
import { homePathForRole } from '@/lib/caregiver/spaces'
import { isNativeApp } from '@/lib/platform'

/**
 * `/` : sur app native → accueil mobile (ou espace si connecté).
 * Sur le web → site marketing (sauf ?app=1 pour prévisualiser).
 */
export function RootHome() {
  const { currentUser, authLoading } = useApp()
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const forceApp = params?.get('app') === '1'
  const forceWeb = params?.get('web') === '1'
  const useMobileHome = (isNativeApp() || forceApp) && !forceWeb

  if (useMobileHome) {
    if (authLoading) return <MobileAppHomePage />
    if (currentUser) return <Navigate to={homePathForRole(currentUser.role)} replace />
    return <MobileAppHomePage />
  }

  return <HomePage />
}
