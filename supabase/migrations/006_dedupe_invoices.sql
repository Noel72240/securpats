-- Supprimer les factures en double (même paiement enregistré 2 fois)
DELETE FROM invoices a
USING invoices b
WHERE a.id > b.id
  AND a.owner_id = b.owner_id
  AND a.amount = b.amount
  AND a.date = b.date
  AND a.plan = b.plan
  AND a.status = b.status;

-- Empêcher les doublons futurs (même propriétaire, même jour, même montant)
CREATE UNIQUE INDEX IF NOT EXISTS invoices_owner_payment_unique
  ON invoices (owner_id, date, amount, plan, status)
  WHERE status = 'paid';
