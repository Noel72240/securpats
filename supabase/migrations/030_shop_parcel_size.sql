-- Taille de colis Mondial Relay fixée par produit (anti-fraude frais d’envoi)
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS parcel_size TEXT NOT NULL DEFAULT 'petit';

ALTER TABLE public.shop_products
  DROP CONSTRAINT IF EXISTS shop_products_parcel_size_check;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_parcel_size_check
  CHECK (parcel_size IN ('petit', 'moyen', 'grand'));

COMMENT ON COLUMN public.shop_products.parcel_size IS
  'Taille colis Mondial Relay définie par l’admin : petit | moyen | grand. Le panier prend la taille max des articles.';

-- Exemples raisonnables (kits / longes / colliers un peu plus volumineux)
UPDATE public.shop_products SET parcel_size = 'moyen' WHERE id IN ('kit-urgence', 'longe-longue', 'collier-premium');
UPDATE public.shop_products SET parcel_size = 'petit' WHERE id IN ('porte-cles-qr', 'plaque-qr', 'jouet-balle', 'jouet-corde');
