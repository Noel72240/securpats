-- QR code propriétaire (fiche famille imprimable + page publique /famille/:token)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS qr_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_qr_token_unique_idx ON profiles (qr_token)
  WHERE qr_token IS NOT NULL;

-- Rétro-génération pour les propriétaires existants
UPDATE profiles
SET qr_token = 'famille-' ||
  lower(regexp_replace(COALESCE(NULLIF(trim(first_name), ''), 'proprietaire'), '[^a-zA-Z0-9]+', '-', 'g')) ||
  '-' || substr(replace(id::text, '-', ''), 1, 8)
WHERE role = 'owner' AND (qr_token IS NULL OR qr_token = '');

-- Bundle public : propriétaire + animaux + référents (données limitées)
CREATE OR REPLACE FUNCTION get_owner_rescue_bundle(token TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object(
    'owner', json_build_object(
      'first_name', p.first_name,
      'last_name', p.last_name
    ),
    'pets', COALESCE((
      SELECT json_agg(json_build_object(
        'name', pt.name,
        'species', pt.species,
        'breed', pt.breed,
        'sex', pt.sex,
        'birth_date', pt.birth_date,
        'weight', pt.weight,
        'photo', pt.photo,
        'allergies', pt.allergies,
        'treatments', pt.treatments,
        'special_instructions', pt.special_instructions,
        'diet', pt.diet,
        'vet_name', pt.vet_name,
        'vet_phone', pt.vet_phone,
        'vet_address', pt.vet_address,
        'identification_number', pt.identification_number,
        'qr_token', pt.qr_token
      ) ORDER BY pt.name)
      FROM pets pt WHERE pt.owner_id = p.id
    ), '[]'::json),
    'referents', COALESCE((
      SELECT json_agg(json_build_object(
        'priority', r.priority,
        'first_name', r.first_name,
        'last_name', r.last_name,
        'phone', r.phone,
        'email', r.email,
        'address', r.address
      ) ORDER BY r.priority)
      FROM referents r WHERE r.owner_id = p.id
    ), '[]'::json)
  )
  FROM profiles p
  WHERE p.qr_token = token AND p.role = 'owner'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_owner_rescue_bundle(TEXT) TO anon, authenticated;

-- Inscription : générer le QR propriétaire à la création du profil
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
  _qr_token text := NULL;
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

  IF _role = 'owner' THEN
    _qr_token := 'famille-' ||
      lower(regexp_replace(COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'first_name'), ''), 'proprietaire'), '[^a-zA-Z0-9]+', '-', 'g')) ||
      '-' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, role, qr_token,
    consent_accepted_at, consent_version, marketing_opt_in
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    _role,
    _qr_token,
    _consent_at,
    COALESCE(NEW.raw_user_meta_data->>'consent_version', ''),
    _marketing
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    qr_token = COALESCE(profiles.qr_token, EXCLUDED.qr_token),
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
