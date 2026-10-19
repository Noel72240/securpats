-- Ebook / produits numériques : fichier privé + liens de téléchargement personnels
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS digital_file_path TEXT NOT NULL DEFAULT '';

-- Bucket privé (PDF ebooks)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('shop-digital', 'shop-digital', false, 52428800)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "shop_digital_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "shop_digital_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "shop_digital_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "shop_digital_admin_delete" ON storage.objects;

CREATE POLICY "shop_digital_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'shop-digital' AND public.is_admin());

CREATE POLICY "shop_digital_admin_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'shop-digital' AND public.is_admin());

CREATE POLICY "shop_digital_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'shop-digital' AND public.is_admin());

CREATE POLICY "shop_digital_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'shop-digital' AND public.is_admin());

-- Droits d’accès après paiement (lien personnel)
CREATE TABLE IF NOT EXISTS shop_digital_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 1,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (stripe_session_id, product_id)
);

CREATE INDEX IF NOT EXISTS shop_digital_downloads_token_idx
  ON shop_digital_downloads (token);

CREATE INDEX IF NOT EXISTS shop_digital_downloads_session_idx
  ON shop_digital_downloads (stripe_session_id);

ALTER TABLE shop_digital_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_digital_downloads_admin_read" ON shop_digital_downloads;
CREATE POLICY "shop_digital_downloads_admin_read" ON shop_digital_downloads
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
