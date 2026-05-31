# SécurPats

Plateforme SaaS de protection animale d'urgence — préparez la prise en charge de vos animaux en cas d'hospitalisation, d'accident ou d'absence imprévue.

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS 4**
- **React Router 7**
- Architecture prête pour **Supabase**, **Stripe** et **Vercel**
- Site vide par défaut — aucune donnée d'exemple

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Comptes

- **Propriétaire** : créer un compte via `/inscription`
- **Admin** : se connecter via `/admin/connexion` (email = `VITE_ADMIN_EMAIL` ou compte Supabase avec `role = admin`)

## Abonnements Stripe

| Formule | Prix | Renouvellement |
|---------|------|----------------|
| Mensuel | **3,99 €/mois** | Automatique |
| Annuel  | **47,88 €/an**  | Automatique |

Configuration détaillée : **[STRIPE.md](STRIPE.md)**

## Conformité légale & sécurité

Pages légales complètes (LCEN, RGPD, cookies), bannière consentement, export/suppression des données, headers sécurité.

Checklist mise en production : **[COMPLIANCE.md](COMPLIANCE.md)**

Copier `.env.example` → `.env` et renseigner les clés Stripe + Price IDs.

## Supabase (Auth, base de données, storage)

Sans variables Supabase, l'app tourne en **mode local** (localStorage).  
Avec `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, bascule automatique vers Supabase.

Configuration détaillée : **[SUPABASE.md](SUPABASE.md)**

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_ADMIN_EMAIL=admin@securpats.fr
```

1. Créer un projet Supabase
2. Exécuter `supabase/migrations/001_initial_schema.sql`
3. Créer les buckets storage (voir SUPABASE.md)
4. Renseigner les variables dans `.env` et sur Vercel

## Fonctionnalités

### Site public
- Accueil, Fonctionnement, Tarifs, FAQ, Contact
- Connexion / Inscription
- Fiche de secours publique (`/secours/:token`)

### Espace propriétaire
- Dashboard, CRUD animaux, référents (max 5)
- Documents, QR Code, Carte d'urgence
- Abonnement Stripe récurrent (`/app/abonnement`)

### Back-office admin
- **Contenu du site** : contacts, adresses, images, témoignages
- Gestion utilisateurs, animaux, missions, statistiques

## Déploiement Vercel

```bash
npm run build
```

Les routes API Stripe sont dans `api/stripe/`. Utiliser `vercel dev` pour tester les paiements en local.
