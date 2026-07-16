-- Boutique SécurPats — produits gérables depuis l'admin
CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  category TEXT NOT NULL DEFAULT 'kits',
  image_url TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  sizes_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shop_products_active_sort_idx
  ON shop_products (active, sort_order, name);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_products_public_read" ON shop_products;
CREATE POLICY "shop_products_public_read" ON shop_products
  FOR SELECT
  USING (active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "shop_products_admin_write" ON shop_products;
CREATE POLICY "shop_products_admin_write" ON shop_products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed initial (ignore si déjà présent)
INSERT INTO shop_products (
  id, slug, name, short_description, description, price_cents, category,
  image_url, image_alt, highlights, sizes_enabled, sizes, active, sort_order
) VALUES
(
  'plaque-qr', 'plaque-qr', 'Plaque QR d’urgence',
  'Plaque métal gravée, scan instantané vers la fiche secours.',
  'Plaque en aluminium anodisé avec QR code SécurPats gravé au laser. Fixation sur collier ou harnais.',
  1290, 'plaques',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
  'Plaque d’identification pour chien',
  ARRAY['Gravure laser durable', 'Compatible collier & harnais', 'Lien vers fiche secours'],
  FALSE, '{}', TRUE, 10
),
(
  'collier-classique', 'collier-classique', 'Collier nylon SécurPats',
  'Collier réglable résistant, boucle sécurisée.',
  'Collier en nylon renforcé avec boucle métal et anneau pour médaille QR.',
  1990, 'colliers',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
  'Collier pour chien en nylon',
  ARRAY['Nylon renforcé', 'Boucle sécurisée', 'Anneau pour plaque QR'],
  TRUE, ARRAY['XS', 'S', 'M', 'L', 'XL'], TRUE, 20
),
(
  'collier-premium', 'collier-premium', 'Collier premium cuir',
  'Cuir véritable, finitions soignées, élégant et solide.',
  'Collier en cuir pleine fleur avec coutures renforcées et boucle laiton.',
  3490, 'colliers',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
  'Collier cuir pour chien',
  ARRAY['Cuir pleine fleur', 'Boucle laiton', 'Finitions premium'],
  TRUE, ARRAY['S', 'M', 'L', 'XL'], TRUE, 30
),
(
  'longe-courte', 'longe-courte', 'Longe courte 1,5 m',
  'Longe urbaine pour promenades maîtrisées.',
  'Longe de 1,5 m en nylon tressé avec poignée confort et mousqueton rotatif.',
  1490, 'longes',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
  'Longe courte pour chien',
  ARRAY['1,5 m — usage urbain', 'Mousqueton rotatif', 'Poignée rembourrée'],
  FALSE, '{}', TRUE, 40
),
(
  'longe-longue', 'longe-longue', 'Longe longue 5 m',
  'Plus de liberté en parc ou jardin clos.',
  'Longe de 5 m légère et résistante, parfaite pour l’éducation.',
  2290, 'longes',
  'https://images.unsplash.com/photo-1547148414-2ccf3a710b7b?w=800&q=80',
  'Longe longue pour chien au parc',
  ARRAY['5 m de longueur', 'Légère & résistante', 'Idéale éducation'],
  FALSE, '{}', TRUE, 50
),
(
  'jouet-corde', 'jouet-corde', 'Jouet corde mastication',
  'Corde tressée pour mâcher et jouer.',
  'Jouet en corde coton tressée, favorise le jeu interactif.',
  990, 'jouets',
  'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800&q=80',
  'Jouet corde pour chien',
  ARRAY['Coton tressé', 'Jeu interactif', 'Entretien facile'],
  FALSE, '{}', TRUE, 60
),
(
  'jouet-balle', 'jouet-balle', 'Balle caoutchouc durable',
  'Balle rebondissante, résistante aux morsures.',
  'Balle en caoutchouc naturel non toxique, rebond stable.',
  790, 'jouets',
  'https://images.unsplash.com/photo-1604079620690-4bccb3470cce?w=800&q=80',
  'Balle jouet pour chien',
  ARRAY['Caoutchouc naturel', 'Rebond stable', 'Résistante'],
  FALSE, '{}', TRUE, 70
),
(
  'porte-cles-qr', 'porte-cles-qr', 'Porte-clés QR référents',
  'QR compact pour les référents d’urgence.',
  'Porte-clés discret avec QR code vers les contacts d’urgence.',
  890, 'plaques',
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
  'Porte-clés avec médaille',
  ARRAY['Format compact', 'QR référents', 'Cadeau utile'],
  FALSE, '{}', TRUE, 80
),
(
  'kit-urgence', 'kit-urgence', 'Kit urgence complet',
  'Plaque QR + collier + porte-clés, prêt à l’emploi.',
  'Pack complet SécurPats : plaque QR, collier nylon et porte-clés référents.',
  3990, 'kits',
  'https://images.unsplash.com/photo-1450778864180-1af5ae229c9e?w=800&q=80',
  'Chien avec accessoires de sécurité',
  ARRAY['Plaque + collier + porte-clés', 'Économie sur le pack', 'Prêt en 2 minutes'],
  TRUE, ARRAY['S', 'M', 'L'], TRUE, 5
)
ON CONFLICT (id) DO NOTHING;
