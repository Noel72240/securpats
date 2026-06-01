-- Annulation d'une mission par le propriétaire (en cours ou en attente)
ALTER TYPE mission_status ADD VALUE IF NOT EXISTS 'cancelled';
