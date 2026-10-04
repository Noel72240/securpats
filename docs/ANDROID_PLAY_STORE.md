# Application Android SécurPats (Play Store)

## Principe

L’app Android est une coque **Capacitor** autour de l’app React existante.
- **Mêmes comptes** Supabase (propriétaire, pet-sitter, bénévole, famille d’accueil)
- **Mêmes données** et **mêmes fonctions** que [www.securpats.fr](https://www.securpats.fr)
- Les API Vercel (`/api/...`) sont appelées sur le site en production

Identifiant Play Store : `fr.securpats.app`

## Prérequis machine (une fois)

1. **Android Studio** : https://developer.android.com/studio  
2. **JDK 21** (Android Studio l’installe souvent)  
3. Variables d’environnement :
   - `ANDROID_HOME` → dossier SDK (souvent `%LOCALAPPDATA%\Android\Sdk`)
   - Java dans le `PATH`

## Build & ouverture Android Studio

```bash
npm run android:sync
npm run android:open
```

Dans Android Studio :
1. Attendre la sync Gradle
2. Brancher un téléphone (mode développeur) **ou** lancer un émulateur
3. Bouton **Run** (▶)

## Générer une AAB pour le Play Store

1. Keystore (une seule fois) : `android/securpats-upload.jks` + `android/keystore.properties`  
   (ne jamais committer — secrets aussi sur le Bureau : `SecurPats-KEYSTORE-SECRETS.txt`)
2. Build :

```bash
npm run android:sync
cd android
.\gradlew.bat bundleRelease
```

Fichier : `android/app/build/outputs/bundle/release/app-release.aab`  
(copie Bureau : `SecurPats-1.0.2.aab`)

## Play Console — test interne (recommandé d’abord)

1. Compte [Google Play Console](https://play.google.com/console) (~25 € une fois)
2. **Créer l’application** → nom **SécurPats**, appli privée/gratuite selon choix
3. Remplir le minimum : fiche store, politique de confidentialité  
   `https://www.securpats.fr/confidentialite`
4. **Tester → Tests internes** → Créer une version → uploader le `.aab`
5. Ajouter tes testeurs (emails Google) → lien d’invitation
6. Remplir le questionnaire **Sécurité des données** (compte, docs, Stripe, etc.)

Publication production : même flux via **Production** après validation Google.

## Icônes / splash

```bash
npm run assets:android
npm run android:sync
```

Sources : `resources/icon.png`, `resources/splash.png`

## Mise à jour après changement du site

```bash
npm run android:sync
```

Puis rebuild release dans Android Studio.

## Notes

- Paiements Stripe : l’utilisateur est redirigé vers Checkout (navigateur / WebView) ; le retour se fait sur le domaine web.
- Emails de confirmation / reset : liens vers le **site** (pas l’origine Capacitor).
- Ne jamais committer le keystore Play Store ni ses mots de passe.
