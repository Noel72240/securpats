-- Fiche identité propriétaire (adresse, date de naissance)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN profiles.address IS 'Adresse postale du propriétaire';
COMMENT ON COLUMN profiles.birth_date IS 'Date de naissance du propriétaire (âge calculé côté client)';
