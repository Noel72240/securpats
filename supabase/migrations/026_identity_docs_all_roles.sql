-- KYC : pièces d'identité + justificatif domicile pour tous les rôles
-- Accès compte uniquement après validation admin

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id_document_path TEXT,
  ADD COLUMN IF NOT EXISTS proof_of_address_path TEXT,
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.id_document_path IS 'Pièce d''identité (propriétaire / admin)';
COMMENT ON COLUMN public.profiles.proof_of_address_path IS 'Justificatif de domicile';
COMMENT ON COLUMN public.profiles.identity_verified IS 'Compte activé après validation admin des documents';

CREATE OR REPLACE FUNCTION public.profiles_sync_identity_verified_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.identity_verified IS TRUE AND (OLD.identity_verified IS DISTINCT FROM TRUE) THEN
    NEW.identity_verified_at := COALESCE(NEW.identity_verified_at, NOW());
  ELSIF NEW.identity_verified IS FALSE THEN
    NEW.identity_verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_sync_identity_verified_at ON public.profiles;
CREATE TRIGGER trg_profiles_sync_identity_verified_at
  BEFORE UPDATE OF identity_verified ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_sync_identity_verified_at();

-- Storage : chemins {userId}/… (petsitter) et {userId}/caregiver/… (aidant)
-- La policy existante (folder[1] = auth.uid) couvre déjà ces chemins.
