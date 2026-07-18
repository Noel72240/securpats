-- Force le changement de mot de passe après reset admin (MDP provisoire)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
