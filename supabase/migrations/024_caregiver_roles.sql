-- Espaces famille d'accueil + bénévole

DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE 'foster_family';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.user_role ADD VALUE 'volunteer';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.caregiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('foster_family', 'volunteer')),
  photo TEXT,
  bio TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  department_code TEXT,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  available_hours TEXT NOT NULL DEFAULT '',
  service_area TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_kind
  ON public.caregiver_profiles (kind);

CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_department
  ON public.caregiver_profiles (department_code)
  WHERE verified = TRUE;

ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_select_own" ON public.caregiver_profiles;
CREATE POLICY "caregiver_select_own" ON public.caregiver_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "caregiver_insert_own" ON public.caregiver_profiles;
CREATE POLICY "caregiver_insert_own" ON public.caregiver_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "caregiver_update_own" ON public.caregiver_profiles;
CREATE POLICY "caregiver_update_own" ON public.caregiver_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Whitelist rôles dans le trigger d'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.user_role := 'owner';
  _marketing boolean := FALSE;
  _consent_at timestamptz;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') IN (
    'owner', 'petsitter', 'admin', 'foster_family', 'volunteer'
  ) THEN
    _role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  END IF;

  IF NEW.raw_user_meta_data ? 'marketing_opt_in' THEN
    _marketing := COALESCE((NEW.raw_user_meta_data->>'marketing_opt_in')::boolean, FALSE);
  END IF;

  IF COALESCE(NEW.raw_user_meta_data->>'consent_accepted_at', '') <> '' THEN
    _consent_at := (NEW.raw_user_meta_data->>'consent_accepted_at')::timestamptz;
  ELSE
    _consent_at := NOW();
  END IF;

  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, role,
    consent_accepted_at, consent_version, marketing_opt_in
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    _role,
    _consent_at,
    COALESCE(NEW.raw_user_meta_data->>'consent_version', ''),
    _marketing
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    consent_accepted_at = EXCLUDED.consent_accepted_at,
    consent_version = EXCLUDED.consent_version,
    marketing_opt_in = EXCLUDED.marketing_opt_in;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$;
