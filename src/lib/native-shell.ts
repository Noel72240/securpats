import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { isNativeApp } from '@/lib/platform'
import { refreshSessionOnResume } from '@/lib/supabase/auth'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/** Initialise les plugins natifs Capacitor (no-op sur le web). */
export async function initNativeShell() {
  if (!isNativeApp()) return

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0f766e' })
  } catch {
    /* web / preview */
  }

  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      void CapApp.exitApp()
    }
  })

  // Après veille / retour app : rafraîchir le JWT pour éviter une déconnexion
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive && isSupabaseConfigured()) {
      void refreshSessionOnResume()
    }
  })

  try {
    await SplashScreen.hide()
  } catch {
    /* optional */
  }
}
