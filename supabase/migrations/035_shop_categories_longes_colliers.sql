-- Catégories produit granulaires : Longes / Colliers (affichage filtre boutique)
-- Reclasse les articles « Promenade & transport » selon le nom / id.

UPDATE shop_products
SET category = 'longes'
WHERE category = 'promenade-transport'
  AND (
    id ILIKE '%longe%'
    OR slug ILIKE '%longe%'
    OR name ILIKE '%longe%'
  );

UPDATE shop_products
SET category = 'colliers'
WHERE category = 'promenade-transport'
  AND (
    id ILIKE '%collier%'
    OR slug ILIKE '%collier%'
    OR name ILIKE '%collier%'
  );
