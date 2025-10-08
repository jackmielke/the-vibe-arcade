-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their uploads
CREATE POLICY "Users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to delete their uploads
CREATE POLICY "Users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');