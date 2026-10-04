-- Extrait de casier judiciaire (bulletin n°3) — facultatif pour pet-sitters
-- L’admin peut consulter le document ; il ne bloque pas la validation du compte.

ALTER TABLE public.petsitter_profiles
  ADD COLUMN IF NOT EXISTS criminal_record_path TEXT;

COMMENT ON COLUMN public.petsitter_profiles.criminal_record_path IS
  'Extrait de casier (bulletin n°3) — facultatif, consultable par l’admin';
