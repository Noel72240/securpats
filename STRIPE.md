# Configuration Stripe — Abonnements récurrents SécurPats

## Tarifs à créer dans Stripe Dashboard

| Formule | Montant | Intervalle | Renouvellement |
|---------|---------|------------|----------------|
| Mensuel | **4,99 €** | `month` | Automatique |
| Annuel  | **49,99 €** | `year`  | Automatique |

## Étapes

### 1. Créer les produits dans Stripe

1. [Dashboard Stripe](https://dashboard.stripe.com) → **Produits** → **Ajouter un produit**
2. **SécurPats Mensuel** — Prix récurrent : `4,99 EUR` / mois
3. **SécurPats Annuel** — Prix récurrent : `49,99 EUR` / an
4. Copier les **Price ID** (`price_xxx`) dans `.env`

### 2. Variables d'environnement

Copier `.env.example` → `.env` et renseigner :

```env
VITE_APP_URL=https://votre-domaine.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_YEARLY=price_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Sur **Vercel** : Project Settings → Environment Variables (mêmes clés).

### 3. Webhook Stripe

1. Stripe → **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://votre-domaine.vercel.app/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Portail client (résiliation / factures)

Stripe → **Settings** → **Billing** → **Customer portal** → Activer.

Les utilisateurs gèrent leur abonnement via **Gérer / Résilier via Stripe** dans `/app/abonnement`.

## Architecture

```
Frontend                    API Vercel (api/stripe/)
─────────                   ────────────────────────
SubscriptionPage    →       create-checkout-session.ts  → Stripe Checkout (mode: subscription)
SubscriptionSuccess →       verify-session.ts           → Confirme le paiement
Gérer abonnement    →       create-portal-session.ts    → Portail client Stripe
Webhook Stripe      →       webhook.ts                  → Sync Supabase (à connecter)
```

## Flux utilisateur

1. Inscription → redirection vers `/app/abonnement`
2. Clic **S'abonner** → Stripe Checkout (CB sécurisée)
3. Paiement OK → `/app/abonnement/succes` → abonnement activé
4. Renouvellement automatique chaque mois (4,99 €) ou chaque année (49,99 €)
5. Résiliation via le portail Stripe

## Test en local

Utiliser [Stripe CLI](https://stripe.com/docs/stripe-cli) :

```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

Les routes `/api/*` nécessitent `vercel dev` en local :

```bash
npx vercel dev
```
