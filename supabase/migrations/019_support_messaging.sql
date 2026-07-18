-- Messagerie interne : clients (propriétaire / pet-sitter) ↔ administrateur
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  client_role TEXT NOT NULL CHECK (client_role IN ('owner', 'petsitter')),
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'Assistance SécurPats',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT NOT NULL DEFAULT '',
  client_unread INT NOT NULL DEFAULT 0,
  admin_unread INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_conversations_last_msg_idx
  ON support_conversations (last_message_at DESC);
CREATE INDEX IF NOT EXISTS support_messages_conversation_idx
  ON support_messages (conversation_id, created_at ASC);

ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_conversations_access" ON support_conversations;
CREATE POLICY "support_conversations_access" ON support_conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = client_id OR public.is_admin())
  WITH CHECK (auth.uid() = client_id OR public.is_admin());

DROP POLICY IF EXISTS "support_messages_access" ON support_messages;
CREATE POLICY "support_messages_access" ON support_messages
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM support_conversations c
      WHERE c.id = conversation_id AND c.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "support_messages_insert" ON support_messages;
CREATE POLICY "support_messages_insert" ON support_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM support_conversations c
        WHERE c.id = conversation_id AND c.client_id = auth.uid()
      )
    )
  );

-- Client : récupère ou crée sa conversation avec le support
CREATE OR REPLACE FUNCTION public.get_or_create_support_conversation()
RETURNS support_conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_row support_conversations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;
  IF v_profile.role::text = 'admin' THEN
    RAISE EXCEPTION 'Les administrateurs utilisent la boîte admin';
  END IF;
  IF v_profile.role::text NOT IN ('owner', 'petsitter') THEN
    RAISE EXCEPTION 'Rôle non autorisé';
  END IF;

  SELECT * INTO v_row FROM support_conversations WHERE client_id = auth.uid();
  IF FOUND THEN
    -- Rafraîchir nom / email affichés
    UPDATE support_conversations
    SET
      client_name = trim(both FROM concat_ws(' ', v_profile.first_name, v_profile.last_name)),
      client_email = COALESCE(v_profile.email, ''),
      client_role = v_profile.role::text
    WHERE id = v_row.id
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  INSERT INTO support_conversations (client_id, client_role, client_name, client_email)
  VALUES (
    v_profile.id,
    v_profile.role::text,
    trim(both FROM concat_ws(' ', v_profile.first_name, v_profile.last_name)),
    COALESCE(v_profile.email, '')
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Admin : ouvre / récupère la conversation d’un client
CREATE OR REPLACE FUNCTION public.admin_open_support_conversation(p_client_id UUID)
RETURNS support_conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_row support_conversations%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Réservé aux administrateurs';
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = p_client_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client introuvable';
  END IF;
  IF v_profile.role::text NOT IN ('owner', 'petsitter') THEN
    RAISE EXCEPTION 'Conversation réservée aux propriétaires et pet-sitters';
  END IF;

  SELECT * INTO v_row FROM support_conversations WHERE client_id = p_client_id;
  IF FOUND THEN
    UPDATE support_conversations
    SET
      client_name = trim(both FROM concat_ws(' ', v_profile.first_name, v_profile.last_name)),
      client_email = COALESCE(v_profile.email, ''),
      client_role = v_profile.role::text
    WHERE id = v_row.id
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  INSERT INTO support_conversations (client_id, client_role, client_name, client_email)
  VALUES (
    v_profile.id,
    v_profile.role::text,
    trim(both FROM concat_ws(' ', v_profile.first_name, v_profile.last_name)),
    COALESCE(v_profile.email, '')
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Envoi message + mise à jour compteurs / aperçu
CREATE OR REPLACE FUNCTION public.send_support_message(p_conversation_id UUID, p_body TEXT)
RETURNS support_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv support_conversations%ROWTYPE;
  v_msg support_messages%ROWTYPE;
  v_body TEXT := trim(p_body);
  v_is_admin BOOLEAN := public.is_admin();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF v_body IS NULL OR char_length(v_body) = 0 THEN
    RAISE EXCEPTION 'Message vide';
  END IF;
  IF char_length(v_body) > 4000 THEN
    RAISE EXCEPTION 'Message trop long';
  END IF;

  SELECT * INTO v_conv FROM support_conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation introuvable';
  END IF;
  IF NOT v_is_admin AND v_conv.client_id <> auth.uid() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  INSERT INTO support_messages (conversation_id, sender_id, body)
  VALUES (p_conversation_id, auth.uid(), v_body)
  RETURNING * INTO v_msg;

  UPDATE support_conversations
  SET
    last_message_at = v_msg.created_at,
    last_message_preview = left(v_body, 160),
    admin_unread = CASE WHEN v_is_admin THEN admin_unread ELSE admin_unread + 1 END,
    client_unread = CASE WHEN v_is_admin THEN client_unread + 1 ELSE client_unread END
  WHERE id = p_conversation_id;

  RETURN v_msg;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_support_conversation_read(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv support_conversations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT * INTO v_conv FROM support_conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF public.is_admin() THEN
    UPDATE support_conversations SET admin_unread = 0 WHERE id = p_conversation_id;
  ELSIF v_conv.client_id = auth.uid() THEN
    UPDATE support_conversations SET client_unread = 0 WHERE id = p_conversation_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_support_conversation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_open_support_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_support_message(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_support_conversation_read(UUID) TO authenticated;
