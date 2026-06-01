-- Propriétaire et admin peuvent supprimer des missions (anti-spam)
DROP POLICY IF EXISTS "missions_owner_delete" ON missions;

CREATE POLICY "missions_owner_delete" ON missions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin());
