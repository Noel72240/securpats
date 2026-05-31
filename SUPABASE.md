# Configuration Supabase — SécurPats

## 1. Créer le projet

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Noter **Project URL** et **anon public key**

## 2. Variables d'environnement

Copier dans `.env` :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_ADMIN_EMAIL=admin@votredomaine.fr
VITE_APP_URL=http://localhost:5173
```

Sur **Vercel** : ajouter les mêmes variables.

## 3. Appliquer le schéma SQL

**Option A — SQL Editor (recommandé pour démarrer)**

1. Dashboard → **SQL Editor**
2. Coller le contenu de `supabase/migrations/001_initial_schema.sql`
3. Exécuter

**Option B — CLI Supabase**

```bash
npm i -g supabase
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase db push
```

## 4. Storage — créer les buckets

Dashboard → **Storage** → New bucket (public si images site, private pour documents) :

| Bucket | Usage | Public |
|--------|-------|--------|
| `documents` | Carnets de santé, ordonnances | Non |
| `avatars` | Photos profil | Oui |
| `pet-photos` | Photos animaux | Oui |
| `petsitter-docs` | CNI, justificatifs | Non |
| `site-assets` | Logo, hero, témoignages | Oui |

Policies storage exemple (documents) :

```sql
CREATE POLICY "documents_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "documents_owner_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 5. Auth

- **Email/Password** : activé par défaut
- Désactiver la confirmation email en dev : Authentication → Providers → Email → Confirm email = off
- **2FA** : Authentication → MFA (à activer quand prêt)

### Connexion admin (`/admin/connexion`)

Page dédiée au back-office (thème sombre, auth Supabase).

1. Dashboard → **Authentication → Users → Add user**
2. Créer l'admin avec email + mot de passe
3. Promouvoir le compte en admin :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@securpats.fr';
```

Ou aligner l'email sur `VITE_ADMIN_EMAIL` — à l'inscription via l'app, ce mail reçoit automatiquement le rôle `admin`.

Accès : [http://localhost:5173/admin/connexion](http://localhost:5173/admin/connexion)

## 6. Connexion Stripe ↔ Supabase

Le webhook Stripe (`api/stripe/webhook.ts`) doit mettre à jour les tables `subscriptions` et `invoices` via la **service role key** (backend uniquement) :

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Vercel only — JAMAIS côté client
SUPABASE_URL=https://xxxxx.supabase.co  # optionnel si VITE_SUPABASE_URL déjà sur Vercel
```

## 7. Architecture frontend

```
src/lib/supabase/
├── client.ts          # Client Supabase typé
├── database.types.ts  # Types tables
├── mappers.ts         # snake_case ↔ camelCase
├── auth.ts            # signIn, signUp, signOut, session
├── services.ts        # CRUD toutes entités
├── storage.ts         # Upload fichiers
└── index.ts
```

L'app bascule automatiquement :
- **Sans `.env` Supabase** → mode local (localStorage)
- **Avec clés configurées** → Supabase Auth + PostgreSQL + Storage

## 8. Tables

| Table | Description |
|-------|-------------|
| `profiles` | Utilisateurs (owner, petsitter, admin) |
| `pets` | Animaux + QR token |
| `referents` | Contacts urgence (max 5) |
| `documents` | Métadonnées fichiers |
| `subscriptions` | Abonnements Stripe |
| `invoices` | Factures |
| `missions` | Urgences / gardes |
| `petsitter_profiles` | Profils pet-sitters |
| `activities` | Journal activité |
| `site_settings` | Contenu site (JSON) |
| `contact_messages` | Formulaire contact |

## 9. RLS (Row Level Security)

Toutes les tables sont protégées :
- Propriétaires : accès à leurs données uniquement
- Admin : accès global via `is_admin()`
- Public : lecture fiche secours via `get_pet_by_qr_token()`

## 10. Regénérer les types TypeScript

Après modification du schéma :

```bash
supabase gen types typescript --project-id VOTRE_REF > src/lib/supabase/database.types.ts
```
