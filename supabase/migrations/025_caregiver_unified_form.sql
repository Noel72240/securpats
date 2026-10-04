-- Espace aidant unifié (bénévole / famille d'accueil / les deux)
-- Formulaire d'inscription enrichi + documents + badge vérifié

-- kind: allow 'both'
ALTER TABLE public.caregiver_profiles
  DROP CONSTRAINT IF EXISTS caregiver_profiles_kind_check;

ALTER TABLE public.caregiver_profiles
  ADD CONSTRAINT caregiver_profiles_kind_check
  CHECK (kind IN ('foster_family', 'volunteer', 'both'));

-- Infos personnelles / localisation
ALTER TABLE public.caregiver_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS postal_code TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS engagement_types TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intervention_radius_km INTEGER,
  ADD COLUMN IF NOT EXISTS can_travel BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN,
  -- Questionnaire détaillé (animaux acceptés, conditions, logement, expérience, urgences…)
  ADD COLUMN IF NOT EXISTS questionnaire JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Documents (chemins storage)
  ADD COLUMN IF NOT EXISTS id_document_path TEXT,
  ADD COLUMN IF NOT EXISTS proof_of_address_path TEXT,
  ADD COLUMN IF NOT EXISTS criminal_record_path TEXT,
  ADD COLUMN IF NOT EXISTS insurance_path TEXT,
  ADD COLUMN IF NOT EXISTS housing_photo_paths TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS outdoor_photo_paths TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS own_animals_photo_paths TEXT[] NOT NULL DEFAULT '{}',
  -- Présentation
  ADD COLUMN IF NOT EXISTS about_me TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS motivation TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS important_notes TEXT NOT NULL DEFAULT '',
  -- Engagements
  ADD COLUMN IF NOT EXISTS info_accuracy_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS charter_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_authorized_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confidentiality_accepted_at TIMESTAMPTZ,
  -- Validation admin
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.caregiver_profiles.engagement_types IS
  'volunteer et/ou foster_family';
COMMENT ON COLUMN public.caregiver_profiles.questionnaire IS
  'Réponses du formulaire (animaux acceptés, conditions d''accueil, logement, animaux du foyer, expérience, disponibilités, urgences)';
COMMENT ON COLUMN public.caregiver_profiles.verified IS
  'Badge Profil vérifié par SécurPats (documents + validation admin)';

-- Sync verified_at when verified flips
CREATE OR REPLACE FUNCTION public.caregiver_sync_verified_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verified IS TRUE AND (OLD.verified IS DISTINCT FROM TRUE) THEN
    NEW.verified_at := COALESCE(NEW.verified_at, NOW());
  ELSIF NEW.verified IS FALSE THEN
    NEW.verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_caregiver_sync_verified_at ON public.caregiver_profiles;
CREATE TRIGGER trg_caregiver_sync_verified_at
  BEFORE UPDATE OF verified ON public.caregiver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.caregiver_sync_verified_at();
