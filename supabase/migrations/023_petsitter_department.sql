-- Département français pour l'annuaire pet-sitters (filtre propriétaires)

ALTER TABLE public.petsitter_profiles
  ADD COLUMN IF NOT EXISTS department_code TEXT;

COMMENT ON COLUMN public.petsitter_profiles.department_code IS
  'Code département FR (ex: 75, 69, 971). Voir src/lib/geo/french-departments.ts';

CREATE INDEX IF NOT EXISTS idx_petsitter_profiles_department
  ON public.petsitter_profiles (department_code)
  WHERE verified = TRUE;

-- Nettoyage si une ancienne colonne région a été créée
DROP INDEX IF EXISTS idx_petsitter_profiles_region;
ALTER TABLE public.petsitter_profiles DROP COLUMN IF EXISTS region_code;

-- Remplace les anciennes signatures (PostgREST)
DROP FUNCTION IF EXISTS public.list_verified_petsitters();
DROP FUNCTION IF EXISTS public.list_verified_petsitters(TEXT);

CREATE OR REPLACE FUNCTION public.list_verified_petsitters(p_department_code TEXT DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  photo TEXT,
  bio TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  available_days TEXT[],
  available_hours TEXT,
  service_area TEXT,
  department_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role::text IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Réservé aux propriétaires';
  END IF;

  RETURN QUERY
  SELECT
    pp.user_id,
    COALESCE(pr.first_name, '')::TEXT,
    COALESCE(pr.last_name, '')::TEXT,
    pp.photo,
    pp.bio,
    pp.phone,
    pp.email,
    pp.address,
    pp.available_days,
    pp.available_hours,
    pp.service_area,
    pp.department_code
  FROM petsitter_profiles pp
  JOIN profiles pr ON pr.id = pp.user_id
  WHERE pp.verified = TRUE
    AND pr.role::text = 'petsitter'
    AND (
      p_department_code IS NULL
      OR btrim(p_department_code) = ''
      OR pp.department_code = p_department_code
    )
  ORDER BY pr.last_name ASC, pr.first_name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_verified_petsitters(TEXT) TO authenticated;
