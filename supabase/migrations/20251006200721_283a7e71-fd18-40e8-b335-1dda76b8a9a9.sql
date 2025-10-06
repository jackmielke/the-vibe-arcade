-- Add anonymous flag to games table
ALTER TABLE public.games
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;