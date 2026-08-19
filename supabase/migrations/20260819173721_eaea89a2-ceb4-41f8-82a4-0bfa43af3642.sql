DROP POLICY IF EXISTS "Public can read music files" ON storage.objects;
DROP POLICY IF EXISTS "Signed in can read music" ON storage.objects;

CREATE POLICY "Read published music files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'music'
  AND EXISTS (
    SELECT 1 FROM public.music_tracks t
    WHERE t.is_published = true
      AND t.url LIKE '%' || storage.objects.name
  )
);