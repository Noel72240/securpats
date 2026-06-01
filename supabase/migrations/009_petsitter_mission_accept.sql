-- Pet-sitters vérifiés peuvent accepter ou refuser les missions en attente
DROP POLICY IF EXISTS "missions_verified_petsitter_pending" ON missions;

CREATE POLICY "missions_verified_petsitter_pending" ON missions
  FOR UPDATE
  TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM petsitter_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.verified = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM petsitter_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.verified = TRUE
    )
    AND (
      status = 'declined'
      OR (status = 'accepted' AND petsitter_id = auth.uid())
    )
  );
