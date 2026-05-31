# Mise en service Supabase — SécurPats (étape par étape)

Projet Supabase : **securpats**  
URL : `https://qnjqjrloohppeadypxja.supabase.co`  
Région : **West EU (Ireland)** — conforme RGPD (données en UE)

---

## Étape 1 — Clés API + fichier `.env` ⬅️ **VOUS ÊTES ICI**

1. Dashboard Supabase → **Project Settings** (engrenage) → **API**
2. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (secret, jamais dans le code client)
3. À la racine du projet, créer le fichier `.env` :

```env
VITE_SUPABASE_URL=https://qnjqjrloohppeadypxja.supabase.co
VITE_SUPABASE_ANON_KEY=coller_la_cle_anon_ici
SUPABASE_SERVICE_ROLE_KEY=coller_la_cle_service_role_ici

VITE_APP_URL=http://localhost:5173
VITE_ADMIN_EMAIL=admin@securpats.fr
```

4. Redémarrer le serveur : `npm run dev`

✅ **Test** : l’app bascule en mode Supabase (plus de données localStorage pour les comptes).

---

## Étape 2 — Base de données (schéma SQL)

1. Dashboard → **SQL Editor** → **New query**
2. Ouvrir le fichier `supabase/migrations/001_initial_schema.sql` dans Cursor
3. **Tout copier** → coller dans l’éditeur SQL → **Run**
4. Vérifier : **Table Editor** → tables `profiles`, `pets`, `referents`, etc.

---

## Étape 3 — Authentification

1. **Authentication** → **Providers** → **Email** : activé
2. En dev : **Confirm email** = **OFF** (inscription immédiate)
3. En prod : remettre **Confirm email** = **ON**
4. **Authentication** → **Users** → **Add user** pour créer l’admin :
   - Email = celui de `VITE_ADMIN_EMAIL`
   - Mot de passe fort
5. **SQL Editor** :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@securpats.fr';
```

---

## Étape 4 — Storage (fichiers) ⬅️ **PROCHAINE ÉTAPE**

Dashboard → **SQL Editor** → coller et exécuter :

`supabase/migrations/003_storage_buckets.sql`

Cela crée les buckets : `documents`, `pet-photos`, `site-assets`, etc. + les règles de sécurité.

Vérifier : **Storage** → les 5 buckets apparaissent.

---

## Étape 5 — Contenu site initial

SQL Editor → exécuter :

`supabase/migrations/004_seed_site_settings.sql`

Ou compléter via **Admin → Contenu du site**.

---

## Étape 6 — Vérification complète

1. `npm run dev` (redémarrer si `.env` modifié)
2. **Admin** → Contenu du site → uploader une image hero (Supabase Storage)
3. Créer un compte **propriétaire** via `/inscription`
4. Ajouter un **animal** + photo
5. Uploader un **document**
6. Tester la **fiche secours** `/secours/:token`

---

## Étape 7 — Stripe + Vercel (plus tard)

Ajouter les mêmes variables + `SUPABASE_URL` pour les API backend.

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Supabase non configuré » | Vérifier `.env` + redémarrer `npm run dev` |
| Inscription bloquée | Désactiver confirmation email (étape 3) |
| Admin sans accès | Exécuter le `UPDATE profiles SET role = admin` |
| Erreur RLS | Vérifier que l’étape 2 SQL a bien tourné sans erreur |
