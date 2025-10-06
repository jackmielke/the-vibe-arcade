-- Add codebase_url column to games table
ALTER TABLE public.games ADD COLUMN codebase_url text;

-- Drop the old insert policy that requires authentication
DROP POLICY IF EXISTS "Creators can insert their own games" ON public.games;

-- Create new insert policy that allows anonymous submissions
CREATE POLICY "Users can insert games"
ON public.games
FOR INSERT
WITH CHECK (
  (auth.uid() = creator_id) OR (creator_id IS NULL)
);