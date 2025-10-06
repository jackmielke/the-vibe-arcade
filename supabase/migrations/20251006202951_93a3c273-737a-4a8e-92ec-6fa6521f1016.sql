-- Refactor comments.user_id to reference profiles.id (not auth.users)
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Performance index for comment listing
CREATE INDEX IF NOT EXISTS idx_comments_game_created_at
ON public.comments (game_id, created_at DESC);