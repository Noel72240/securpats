-- À exécuter dans Supabase → SQL Editor si l'inscription pet-sitter échoue
-- (colonnes id_consent_at / plan petsitter_vip manquantes)

-- 007 — consentement pièce d'identité
ALTER TABLE petsitter_profiles
  ADD COLUMN IF NOT EXISTS id_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS id_consent_version TEXT;

-- 008 — abonnement VIP pet-sitter (9,90 €/mois)
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'petsitter_vip';

-- 009 — missions : seuls les pet-sitters validés peuvent accepter (voir migrations/009_petsitter_mission_accept.sql)

-- 010 — prise de mission exclusive (un seul pet-sitter) : exécuter migrations/010_accept_mission_rpc.sql

-- 011 — doublons abonnements : exécuter migrations/011_dedupe_subscriptions.sql

-- 012 — suppression missions par propriétaire/admin : migrations/012_missions_owner_delete.sql

-- 013 — statut cancelled pour annulation propriétaire : migrations/013_mission_cancelled_status.sql
