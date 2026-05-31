-- SécurPats — Correctifs sécurité RLS + consentement RGPD + RPC référents secours
-- À exécuter après 001_initial_schema.sql

-- ─── Supprimer les policies trop permissives ─────────────────
DROP POLICY IF EXISTS "pets_public_rescue" ON pets;
DROP POLICY IF EXISTS "referents_public_read" ON referents;

-- Accès public uniquement via fonctions SECURITY DEFINER (token QR)

CREATE OR REPLACE FUNCTION get_referents_by_qr_token(token TEXT)
RETURNS SETOF referents AS $$
  SELECT r.*
  FROM referents r
  INNER JOIN pets p ON p.owner_id = r.owner_id
  WHERE p.qr_token = token
  ORDER BY r.priority
  LIMIT 3;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_referents_by_qr_token(TEXT) TO anon, authenticated;

-- ─── Consentement RGPD sur profils ─────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_version TEXT,
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT FALSE;

-- ─── Consentement formulaire contact ─────────────────────────
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ DEFAULT NOW();
