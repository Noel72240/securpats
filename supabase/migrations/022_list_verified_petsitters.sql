-- Annuaire pet-sitters vérifiés pour les propriétaires (urgence)
CREATE OR REPLACE FUNCTION public.list_verified_petsitters()
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
  service_area TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Propriétaires et admins uniquement
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
    pp.service_area
  FROM petsitter_profiles pp
  JOIN profiles pr ON pr.id = pp.user_id
  WHERE pp.verified = TRUE
    AND pr.role::text = 'petsitter'
  ORDER BY pr.last_name ASC, pr.first_name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_verified_petsitters() TO authenticated;
