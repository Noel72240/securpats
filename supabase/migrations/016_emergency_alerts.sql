-- Alertes urgence en deux étapes : déclenchement → confirmation référent → procédure active

CREATE TYPE emergency_alert_status AS ENUM ('pending_confirmation', 'confirmed', 'cancelled');

CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  pet_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  triggered_by TEXT NOT NULL DEFAULT 'public',
  source_token TEXT,
  status emergency_alert_status NOT NULL DEFAULT 'pending_confirmation',
  confirmed_referent_id UUID REFERENCES referents(id) ON DELETE SET NULL,
  confirmed_referent_name TEXT,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE emergency_alert_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  referent_id UUID NOT NULL REFERENCES referents(id) ON DELETE CASCADE,
  confirm_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  notified_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  UNIQUE(alert_id, referent_id)
);

CREATE INDEX emergency_alerts_owner_id_idx ON emergency_alerts(owner_id);
CREATE INDEX emergency_alerts_status_idx ON emergency_alerts(status);
CREATE INDEX emergency_alert_confirmations_token_idx ON emergency_alert_confirmations(confirm_token);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alert_confirmations ENABLE ROW LEVEL SECURITY;

-- Lecture publique minimale pour la page de confirmation (sans données sensibles)
CREATE OR REPLACE FUNCTION get_emergency_confirm_preview(p_token TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object(
    'pet_name', a.pet_name,
    'description', a.description,
    'status', a.status,
    'referent_first_name', r.first_name,
    'referent_last_name', r.last_name,
    'already_confirmed', (c.confirmed_at IS NOT NULL),
    'alert_confirmed', (a.status = 'confirmed'),
    'confirmed_by', a.confirmed_referent_name
  )
  FROM emergency_alert_confirmations c
  JOIN emergency_alerts a ON a.id = c.alert_id
  JOIN referents r ON r.id = c.referent_id
  WHERE c.confirm_token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_emergency_confirm_preview(TEXT) TO anon, authenticated;
