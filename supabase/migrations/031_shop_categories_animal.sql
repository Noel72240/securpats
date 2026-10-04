-- Boutique : nouvelles catégories + animal concerné
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS animal_target TEXT NOT NULL DEFAULT 'tous';

-- Remap anciennes catégories → nouvelles
UPDATE shop_products SET category = 'identification-securite' WHERE category = 'plaques';
UPDATE shop_products SET category = 'promenade-transport' WHERE category IN ('colliers', 'longes');
UPDATE shop_products SET category = 'jeux-occupation' WHERE category = 'jouets';
UPDATE shop_products SET category = 'kits-securpats' WHERE category = 'kits';

-- Défaut raisonnable pour les produits déjà en base
UPDATE shop_products
SET animal_target = 'tous'
WHERE animal_target IS NULL OR animal_target = '';

CREATE INDEX IF NOT EXISTS shop_products_category_idx ON shop_products (category);
CREATE INDEX IF NOT EXISTS shop_products_animal_target_idx ON shop_products (animal_target);
