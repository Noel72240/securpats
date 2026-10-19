-- Un seul téléchargement par lien ebook (anti-duplication)
ALTER TABLE shop_digital_downloads
  ALTER COLUMN max_downloads SET DEFAULT 1;

UPDATE shop_digital_downloads
SET max_downloads = 1
WHERE max_downloads > 1;
