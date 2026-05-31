-- Consentement RGPD pour pièce d'identité pet-sitter
ALTER TABLE petsitter_profiles
  ADD COLUMN IF NOT EXISTS id_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS id_consent_version TEXT;

COMMENT ON COLUMN petsitter_profiles.id_document_path IS 'Chemin Storage (bucket petsitter-docs) — obligatoire pour inscription';
COMMENT ON COLUMN petsitter_profiles.id_consent_at IS 'Date du consentement explicite au traitement de la pièce d''identité';
