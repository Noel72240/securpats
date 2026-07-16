-- Gazette / Actu SécurPats — articles pour SEO
CREATE TABLE IF NOT EXISTS actu_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '',
  cover_image_alt TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  author_name TEXT NOT NULL DEFAULT 'SécurPats',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS actu_posts_published_idx
  ON actu_posts (published, published_at DESC);

ALTER TABLE actu_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "actu_posts_public_read" ON actu_posts;
CREATE POLICY "actu_posts_public_read" ON actu_posts
  FOR SELECT
  USING (published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "actu_posts_admin_write" ON actu_posts;
CREATE POLICY "actu_posts_admin_write" ON actu_posts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Articles de démarrage (ignore si déjà présents)
INSERT INTO actu_posts (
  id, slug, title, excerpt, body, cover_image_url, cover_image_alt,
  seo_title, seo_description, keywords, author_name, published, published_at
) VALUES
(
  'lancer-referents-urgence',
  'lancer-referents-urgence',
  'Pourquoi désigner des référents d’urgence pour son animal',
  'En cas d’hospitalisation ou d’accident, qui s’occupe de votre chien ou chat ? Voici pourquoi anticiper change tout.',
  E'Quand une urgence personnelle survient — accident, hospitalisation, absence imprévue — la priorité des secours est votre santé. Votre animal, lui, reste souvent sans solution immédiate.\n\nDésigner des référents d’urgence, c’est choisir à l’avance les personnes qui pourront être contactées pour nourrir, sortir ou héberger temporairement votre compagnon.\n\nAvec SécurPats, ces contacts sont organisés, alertés automatiquement et disposent des consignes essentielles (alimentation, traitements, vétérinaire).\n\nTrois bons réflexes :\n\n1. Choisissez au moins deux référents de confiance, idéalement proches géographiquement.\n2. Mettez à jour leurs coordonnées et les infos de votre animal.\n3. Testez le parcours (QR code, fiche imprimable) pour être serein le jour J.\n\nAnticiper aujourd’hui, c’est éviter le stress et l’improvisation demain — pour vous comme pour votre animal.',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
  'Chien regardant son propriétaire',
  'Référents d’urgence animal : pourquoi anticiper | SécurPats',
  'Découvrez pourquoi désigner des référents d’urgence pour votre animal est essentiel en cas d’hospitalisation ou d’accident.',
  ARRAY['référents urgence animal', 'garde animal hospitalisation', 'sécurité animal'],
  'SécurPats',
  TRUE,
  NOW() - INTERVAL '7 days'
),
(
  'qr-code-secours-animal',
  'qr-code-secours-animal',
  'Le QR code secours : comment ça protège vraiment votre animal',
  'Une plaque ou un support scannable peut faire gagner de précieuses minutes aux secours et à vos proches.',
  E'Le QR code SécurPats relie physiquement votre animal (collier, harnais, porte-clés) à une fiche de secours en ligne.\n\nEn cas d’accident vous concernant, un témoin, un soignant ou un proche peut scanner le code et accéder aux informations utiles : identité de l’animal, consignes, contacts de référents.\n\nCe n’est pas un gadget : c’est un maillon concret de la chaîne de protection, complémentaire à votre abonnement et à vos référents.\n\nConseils pratiques :\n\n- Placez le QR sur un support solide (plaque, collier) et vérifiez qu’il reste lisible.\n- Mettez à jour la fiche après chaque changement (adresse, traitements, vétérinaire).\n- Conservez aussi une fiche imprimable dans votre portefeuille.\n\nLa protection animale d’urgence repose sur la préparation. Le QR code est l’outil qui rend cette préparation visible et actionnable sur le terrain.',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&q=80',
  'Collier et identification pour chien',
  'QR code secours animal : à quoi ça sert | SécurPats',
  'Comprendre le rôle du QR code secours SécurPats pour protéger votre animal en cas d’urgence.',
  ARRAY['QR code animal', 'fiche secours chien', 'identification urgence'],
  'SécurPats',
  TRUE,
  NOW() - INTERVAL '3 days'
),
(
  'checklist-absence-imprevue',
  'checklist-absence-imprevue',
  'Checklist : préparer l’absence imprévue de son animal',
  'Retard, voyage interrompu, hospitalisation soudaine… une checklist simple pour ne rien laisser au hasard.',
  E'Personne ne prévoit une urgence. En revanche, on peut préparer le terrain pour que l’animal soit pris en charge rapidement.\n\nVoici une checklist courte, à revoir une fois par trimestre :\n\n1. Référents à jour (téléphone, disponibilité, proximité).\n2. Fiche animal complète : alimentation, allergies, traitements, vétérinaire.\n3. QR code et fiche imprimable accessibles.\n4. Stock de croquettes / litière / médicaments pour quelques jours.\n5. Clés ou consignes d’accès pour le référent (si pertinent).\n\nAvec SécurPats, l’alerte et la transmission des infos sont centralisées : vous concentrez l’essentiel dans un seul espace.\n\nLa meilleure protection reste la régularité : une petite mise à jour aujourd’hui vaut mieux qu’une improvisation le jour de l’urgence.',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80',
  'Deux chiens en promenade',
  'Checklist absence imprévue animal | SécurPats',
  'Préparez l’absence imprévue de votre animal grâce à une checklist simple et efficace.',
  ARRAY['absence imprévue animal', 'checklist garde chien', 'urgence propriétaire'],
  'SécurPats',
  TRUE,
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
