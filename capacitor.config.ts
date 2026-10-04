import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.securpats.app',
  appName: 'SécurPats',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Pas de server.url : l’app embarque le build (Play Store)
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0f766e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f766e',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0f766e',
  },
}

export default config
