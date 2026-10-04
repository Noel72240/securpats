-- Suivi des relances disponibilités (pet-sitters, bénévoles, familles d’accueil)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_availability_reminder_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.last_availability_reminder_at IS
  'Dernier email de confirmation de disponibilités (tous les 15 jours)';
