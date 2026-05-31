-- Fix inscription : "Database error saving new user"
-- Cause : trigger handle_new_user bloqué par RLS ou cast metadata invalide
-- Exécuter dans Supabase SQL Editor

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') IN ('owner', 'petsitter', 'admin') THEN
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

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policy de secours : le service role peut toujours insérer un profil
DROP POLICY IF EXISTS "profiles_insert_service" ON profiles;
CREATE POLICY "profiles_insert_service" ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);
