-- Add arcade column to games table
-- This determines if a game appears in the arcade (true) or is just a portfolio project (false)
ALTER TABLE public.games 
ADD COLUMN arcade boolean NOT NULL DEFAULT true;

-- Set all existing games to be in the arcade by default
UPDATE public.games SET arcade = true WHERE arcade IS NULL;