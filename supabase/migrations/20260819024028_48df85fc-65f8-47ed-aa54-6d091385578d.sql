CREATE POLICY "Public can read music files" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'music');