-- Formulaire structuré : directives anticipées (décès du propriétaire)
CREATE TABLE IF NOT EXISTS advance_directives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- Vide = tous les animaux du compte
  pet_ids TEXT[] NOT NULL DEFAULT '{}',
  -- Priorité 1 : à qui confier
  priority_name TEXT NOT NULL DEFAULT '',
  priority_phone TEXT NOT NULL DEFAULT '',
  priority_relation TEXT NOT NULL DEFAULT '',
  -- Priorité 2 : si indisponible
  backup_name TEXT NOT NULL DEFAULT '',
  backup_phone TEXT NOT NULL DEFAULT '',
  backup_relation TEXT NOT NULL DEFAULT '',
  -- Priorité 3 : si ne peut pas prendre
  tertiary_name TEXT NOT NULL DEFAULT '',
  tertiary_phone TEXT NOT NULL DEFAULT '',
  tertiary_relation TEXT NOT NULL DEFAULT '',
  allow_partner_shelter BOOLEAN NOT NULL DEFAULT FALSE,
  allow_foster_family BOOLEAN NOT NULL DEFAULT FALSE,
  people_to_notify TEXT NOT NULL DEFAULT '',
  special_instructions TEXT NOT NULL DEFAULT '',
  medication TEXT NOT NULL DEFAULT '',
  feeding_habits TEXT NOT NULL DEFAULT '',
  daily_habits TEXT NOT NULL DEFAULT '',
  veterinarian_info TEXT NOT NULL DEFAULT '',
  signed_full_name TEXT NOT NULL DEFAULT '',
  signature_data TEXT NOT NULL DEFAULT '',
  consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT NOT NULL DEFAULT '',
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS advance_directives_owner_idx ON advance_directives (owner_id);

ALTER TABLE advance_directives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advance_directives_owner_all" ON advance_directives;
CREATE POLICY "advance_directives_owner_all" ON advance_directives
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_admin());
