-- Stock boutique : quantité disponible + décrément atomique à l'achat
ALTER TABLE shop_products
  ADD COLUMN IF NOT EXISTS stock_qty INTEGER NOT NULL DEFAULT 100
  CHECK (stock_qty >= 0);

-- Intentions de checkout (reliées à Stripe) pour appliquer le stock une seule fois
CREATE TABLE IF NOT EXISTS shop_checkout_intents (
  stripe_session_id TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_email TEXT,
  stock_applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stock_applied_at TIMESTAMPTZ
);

ALTER TABLE shop_checkout_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_checkout_intents_admin_read" ON shop_checkout_intents;
CREATE POLICY "shop_checkout_intents_admin_read" ON shop_checkout_intents
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Décrémente le stock si quantité suffisante (appel service role / webhook)
CREATE OR REPLACE FUNCTION public.decrement_shop_stock(p_product_id TEXT, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 OR p_product_id IS NULL OR length(trim(p_product_id)) = 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE shop_products
  SET
    stock_qty = stock_qty - p_qty,
    updated_at = NOW()
  WHERE id = p_product_id
    AND stock_qty >= p_qty;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_shop_stock(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_shop_stock(TEXT, INTEGER) TO service_role;
