# Conformité légale & sécurité — SécurPats

Guide pour une mise en production conforme aux normes **françaises** (LCEN, CNIL) et **européennes** (RGPD, ePrivacy).

## Ce qui est déjà en place

### Pages légales
| Page | Route |
|------|-------|
| Mentions légales (LCEN) | `/mentions-legales` |
| CGU | `/cgu` |
| Politique de confidentialité | `/confidentialite` |
| Informations RGPD | `/rgpd` |
| Politique cookies | `/cookies` |

Contenu alimenté dynamiquement depuis **Admin → Contenu du site → Légal & Footer** (SIRET, RCS, DPO, etc.).

### Consentements
- Inscription : CGU + confidentialité (obligatoire), marketing (optionnel), horodatage enregistré
- Contact : consentement RGPD explicite
- Référents : certification du consentement du tiers
- Pet-sitter : CGU + traitement pièce d'identité
- Bannière cookies CNIL (pas de tracking publicitaire)

### Droits RGPD utilisateur
- Export JSON : `/app/donnees-personnelles`
- Suppression de compte (API sécurisée avec JWT Supabase)

### Sécurité technique
- Headers HTTP : CSP, HSTS, X-Frame-Options, Referrer-Policy (`vercel.json`)
- RLS Supabase : pas de liste publique animaux/référents — accès QR token uniquement
- Paiement Stripe : vérification JWT avant création de session checkout
- Pas de Google Fonts (évite traceur tiers CNIL)
- Clés secrètes backend uniquement (Stripe, Supabase service role)

## Avant mise en production — checklist obligatoire

### 1. Informations légales (Admin)
Compléter dans l'admin :
- [ ] Raison sociale, forme juridique, SIRET, RCS, TVA, capital
- [ ] Directeur de publication
- [ ] Adresse postale complète
- [ ] Email DPO (`dpo@votredomaine.fr`)
- [ ] Médiateur de la consommation (obligatoire B2C)

### 2. Supabase
- [ ] Projet créé en **région EU** (Frankfurt ou Paris)
- [ ] Exécuter `001_initial_schema.sql` (+ `002` si migration depuis ancienne version)
- [ ] Activer **leaked password protection** (Auth → Settings)
- [ ] Configurer les buckets storage avec policies restrictives
- [ ] Désactiver confirmation email en dev, activer en prod

### 3. Vercel
- [ ] Variables d'environnement configurées
- [ ] Domaine HTTPS actif (HSTS activé automatiquement)
- [ ] `VITE_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` séparées

### 4. Documents internes (hors code)
- [ ] Registre des traitements (RGPD art. 30)
- [ ] DPIA si volume important ou données sensibles
- [ ] Contrats DPA avec Supabase, Vercel, Stripe
- [ ] Procédure de réponse aux demandes d'exercice de droits

## Mode local (sans Supabase)

Le mode localStorage est prévu pour le **développement uniquement**.
Ne pas utiliser en production : pas de chiffrement serveur, pas d'audit trail, pas de suppression auth centralisée.

## Contact CNIL

En cas de réclamation utilisateur : [www.cnil.fr/fr/plaintes](https://www.cnil.fr/fr/plaintes)
