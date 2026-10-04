-- ACACED (Attestation de connaissances pour les animaux de compagnie d’espèces domestiques)
-- Facultatif — pet-sitters. Pour aidants, stocké dans questionnaire JSON (hasAcaced).

ALTER TABLE public.petsitter_profiles
  ADD COLUMN IF NOT EXISTS has_acaced BOOLEAN;

COMMENT ON COLUMN public.petsitter_profiles.has_acaced IS
  'Dispose de l’ACACED — facultatif';
