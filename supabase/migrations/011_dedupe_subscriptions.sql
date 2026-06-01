-- Supprimer les abonnements en double (même utilisateur + même plan)
DELETE FROM subscriptions a
USING subscriptions b
WHERE a.id > b.id
  AND a.owner_id = b.owner_id
  AND a.plan = b.plan;

-- Un seul abonnement par plan et par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_owner_plan_unique
  ON subscriptions (owner_id, plan);
