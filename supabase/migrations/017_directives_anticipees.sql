-- Catégorie documents : directives anticipées (décès du propriétaire)
DO $$
BEGIN
  ALTER TYPE document_category ADD VALUE 'directives_anticipees';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
