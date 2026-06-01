-- Prise de mission atomique : un seul pet-sitter vérifié peut accepter une mission en attente
CREATE OR REPLACE FUNCTION public.accept_mission(p_mission_id UUID)
RETURNS missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row missions;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM petsitter_profiles
    WHERE user_id = v_uid AND verified = TRUE
  ) THEN
    RAISE EXCEPTION 'Compte pet-sitter non validé';
  END IF;

  UPDATE missions
  SET status = 'accepted', petsitter_id = v_uid
  WHERE id = p_mission_id
    AND status = 'pending'
    AND petsitter_id IS NULL
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cette mission a déjà été acceptée par un autre pet-sitter.';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_mission(UUID) TO authenticated;

-- Temps réel : les autres pet-sitters voient disparaître une mission dès qu'elle est prise
ALTER PUBLICATION supabase_realtime ADD TABLE missions;
