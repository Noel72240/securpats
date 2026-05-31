-- SécurPats — Schéma initial Supabase
-- Exécuter via : supabase db push  OU  SQL Editor du dashboard Supabase

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('owner', 'petsitter', 'admin');
CREATE TYPE document_category AS ENUM ('carnet_sante', 'ordonnance', 'facture', 'assurance', 'divers');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE mission_status AS ENUM ('pending', 'accepted', 'declined', 'completed');
CREATE TYPE mission_type AS ENUM ('urgence', 'garde');
CREATE TYPE invoice_status AS ENUM ('paid', 'pending', 'failed');

-- ─── Profiles (lié à auth.users) ────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'owner',
  avatar_url TEXT,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  consent_accepted_at TIMESTAMPTZ,
  consent_version TEXT,
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Pets ───────────────────────────────────────────────────
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo TEXT,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT '',
  breed TEXT NOT NULL DEFAULT '',
  sex TEXT NOT NULL DEFAULT 'Mâle',
  birth_date DATE,
  weight NUMERIC(6,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '',
  identification_number TEXT NOT NULL DEFAULT '',
  treatments TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '',
  diet TEXT NOT NULL DEFAULT '',
  special_instructions TEXT NOT NULL DEFAULT '',
  vet_name TEXT NOT NULL DEFAULT '',
  vet_phone TEXT NOT NULL DEFAULT '',
  vet_address TEXT NOT NULL DEFAULT '',
  qr_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pets_owner_id_idx ON pets(owner_id);
CREATE INDEX pets_qr_token_idx ON pets(qr_token);

-- ─── Referents ────────────────────────────────────────────────
CREATE TABLE referents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 1,
  CONSTRAINT referents_priority_check CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX referents_owner_id_idx ON referents(owner_id);

-- ─── Documents ──────────────────────────────────────────────
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category document_category NOT NULL DEFAULT 'divers',
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX documents_owner_id_idx ON documents(owner_id);

-- ─── Subscriptions ──────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  price NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX subscriptions_owner_id_idx ON subscriptions(owner_id);

-- ─── Invoices ───────────────────────────────────────────────
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'paid',
  plan subscription_plan NOT NULL,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Missions ───────────────────────────────────────────────
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  petsitter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type mission_type NOT NULL DEFAULT 'garde',
  status mission_status NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Pet-Sitter profiles ────────────────────────────────────
CREATE TABLE petsitter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  photo TEXT,
  bio TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  id_document_path TEXT,
  proof_of_address_path TEXT,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  available_hours TEXT NOT NULL DEFAULT '',
  service_area TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Activities ─────────────────────────────────────────────
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX activities_owner_id_idx ON activities(owner_id);

-- ─── Site settings (JSON global) ────────────────────────────
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, settings) VALUES ('global', '{}') ON CONFLICT DO NOTHING;

-- ─── Contact messages ─────────────────────────────────────────
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Helper : admin check ───────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Public rescue : fiche par QR token ─────────────────────
CREATE OR REPLACE FUNCTION get_pet_by_qr_token(token TEXT)
RETURNS SETOF pets AS $$
  SELECT * FROM pets WHERE qr_token = token LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_pet_by_qr_token(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION get_referents_by_qr_token(token TEXT)
RETURNS SETOF referents AS $$
  SELECT r.*
  FROM referents r
  INNER JOIN pets p ON p.owner_id = r.owner_id
  WHERE p.qr_token = token
  ORDER BY r.priority
  LIMIT 3;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_referents_by_qr_token(TEXT) TO anon, authenticated;

-- ─── Auto-create profile on signup ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE referents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE petsitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets
CREATE POLICY "pets_owner_all" ON pets FOR ALL USING (auth.uid() = owner_id OR is_admin());
-- Accès public : uniquement via get_pet_by_qr_token() (SECURITY DEFINER)

-- Referents
CREATE POLICY "referents_owner_all" ON referents FOR ALL USING (auth.uid() = owner_id OR is_admin());
-- Accès public : uniquement via get_referents_by_qr_token() (SECURITY DEFINER)

-- Documents
CREATE POLICY "documents_owner_all" ON documents FOR ALL USING (auth.uid() = owner_id OR is_admin());

-- Subscriptions
CREATE POLICY "subscriptions_owner_read" ON subscriptions FOR SELECT USING (auth.uid() = owner_id OR is_admin());
CREATE POLICY "subscriptions_owner_write" ON subscriptions FOR ALL USING (auth.uid() = owner_id OR is_admin());

-- Invoices
CREATE POLICY "invoices_owner_read" ON invoices FOR SELECT USING (auth.uid() = owner_id OR is_admin());
CREATE POLICY "invoices_service_write" ON invoices FOR INSERT WITH CHECK (is_admin() OR auth.uid() = owner_id);

-- Missions
CREATE POLICY "missions_read" ON missions FOR SELECT USING (
  auth.uid() = owner_id OR auth.uid() = petsitter_id OR is_admin() OR status = 'pending'
);
CREATE POLICY "missions_owner_insert" ON missions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "missions_update" ON missions FOR UPDATE USING (
  auth.uid() = owner_id OR auth.uid() = petsitter_id OR is_admin()
);

-- Pet-sitter profiles
CREATE POLICY "petsitter_own" ON petsitter_profiles FOR ALL USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "petsitter_public_read" ON petsitter_profiles FOR SELECT USING (verified = TRUE OR is_admin());

-- Activities
CREATE POLICY "activities_owner" ON activities FOR ALL USING (auth.uid() = owner_id OR is_admin());

-- Site settings : lecture publique, écriture admin
CREATE POLICY "site_settings_public_read" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "site_settings_admin_write" ON site_settings FOR ALL USING (is_admin());

-- Contact : insertion publique, lecture admin
CREATE POLICY "contact_insert_public" ON contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "contact_admin_read" ON contact_messages FOR SELECT USING (is_admin());

-- ─── Storage buckets (à créer dans Dashboard ou via API) ────
-- documents, avatars, pet-photos, petsitter-docs, site-assets
-- Policies storage à configurer dans Supabase Dashboard > Storage
