-- SécurPats — Storage buckets + policies
-- Exécuter dans Supabase SQL Editor (après 001_initial_schema.sql)
-- Réexécutable : DROP IF EXISTS avant chaque policy

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('documents', 'documents', false, 52428800),
  ('avatars', 'avatars', true, 5242880),
  ('pet-photos', 'pet-photos', true, 10485760),
  ('petsitter-docs', 'petsitter-docs', false, 10485760),
  ('site-assets', 'site-assets', true, 10485760)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- ─── documents (privé — propriétaire + admin) ───────────────
DROP POLICY IF EXISTS "documents_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_storage_delete" ON storage.objects;

CREATE POLICY "documents_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "documents_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ─── pet-photos (public read, owner write) ──────────────────
DROP POLICY IF EXISTS "pet_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_delete" ON storage.objects;

CREATE POLICY "pet_photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pet_photos_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'pet-photos');

CREATE POLICY "pet_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pet_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ─── avatars ────────────────────────────────────────────────
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── petsitter-docs (privé) ─────────────────────────────────
DROP POLICY IF EXISTS "petsitter_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "petsitter_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "petsitter_docs_delete" ON storage.objects;

CREATE POLICY "petsitter_docs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'petsitter-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "petsitter_docs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'petsitter-docs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "petsitter_docs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'petsitter-docs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ─── site-assets (public read, admin write) ─────────────────
DROP POLICY IF EXISTS "site_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "site_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "site_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "site_assets_delete" ON storage.objects;

CREATE POLICY "site_assets_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());
