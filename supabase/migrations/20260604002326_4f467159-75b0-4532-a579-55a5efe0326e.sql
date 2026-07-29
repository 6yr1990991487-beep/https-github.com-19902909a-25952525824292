-- Remove existing duplicates, keeping the most recently created row
DELETE FROM public.imported_videos a
USING public.imported_videos b
WHERE a.source = b.source
  AND a.external_id = b.external_id
  AND a.external_id IS NOT NULL
  AND a.created_at < b.created_at;

-- Enforce uniqueness so upserts deduplicate on (source, external_id)
CREATE UNIQUE INDEX IF NOT EXISTS imported_videos_source_external_id_key
  ON public.imported_videos (source, external_id)
  WHERE external_id IS NOT NULL;