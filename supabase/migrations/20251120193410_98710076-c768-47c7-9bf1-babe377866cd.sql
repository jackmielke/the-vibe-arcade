-- Allow anonymous likes and comments by making user_id nullable
ALTER TABLE public.likes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.comments ALTER COLUMN user_id DROP NOT NULL;

-- Add optional tracking fields for anonymous interactions
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS anonymous_id text;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS anonymous_id text;

-- Update RLS policies to allow public interactions
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.likes;
CREATE POLICY "Anyone can create likes"
  ON public.likes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Anyone can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can update their own comments or anonymous can update by id"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own comments or anonymous can delete by id"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);