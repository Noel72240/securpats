import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { isNativeApp } from '@/lib/platform'

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

  try {
    await SplashScreen.hide()
  } catch {
    /* optional */
  }
}
