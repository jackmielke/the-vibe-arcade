-- Create storage bucket for game thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-thumbnails',
  'game-thumbnails',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow anyone to view thumbnails
CREATE POLICY "Game thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-thumbnails');

-- Allow anyone to upload thumbnails (anonymous submissions)
CREATE POLICY "Anyone can upload game thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-thumbnails');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'game-thumbnails');