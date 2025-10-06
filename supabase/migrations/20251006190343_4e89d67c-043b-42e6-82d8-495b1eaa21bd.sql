-- Remove approval requirement - make all games visible to everyone
DROP POLICY IF EXISTS "Approved games are viewable by everyone" ON public.games;

CREATE POLICY "All games are viewable by everyone" 
ON public.games 
FOR SELECT 
USING (true);