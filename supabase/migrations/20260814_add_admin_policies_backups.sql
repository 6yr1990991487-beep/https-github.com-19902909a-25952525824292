-- Add explicit admin policies to backup tables and ensure news_cache is not publicly readable

-- Ensure news_cache is protected
ALTER TABLE IF EXISTS public.news_cache ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON public.news_cache FROM public;
REVOKE SELECT ON public.news_cache FROM anon;
REVOKE SELECT ON public.news_cache FROM authenticated;
DROP POLICY IF EXISTS news_cache_public_read ON public.news_cache;

-- Backup tables: allow admin users to manage (insert/update/delete/select)
ALTER TABLE IF EXISTS public.imported_videos_backup ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON public.imported_videos_backup FROM anon;
REVOKE SELECT ON public.imported_videos_backup FROM authenticated;

DROP POLICY IF EXISTS "admin_all_imported_videos_backup" ON public.imported_videos_backup;
CREATE POLICY "admin_all_imported_videos_backup" ON public.imported_videos_backup
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE IF EXISTS public.youtube_manga_videos_backup ENABLE ROW LEVEL SECURITY;
REVOKE SELECT ON public.youtube_manga_videos_backup FROM anon;
REVOKE SELECT ON public.youtube_manga_videos_backup FROM authenticated;

DROP POLICY IF EXISTS "admin_all_youtube_manga_videos_backup" ON public.youtube_manga_videos_backup;
CREATE POLICY "admin_all_youtube_manga_videos_backup" ON public.youtube_manga_videos_backup
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant read to service_role for maintenance tasks
GRANT SELECT ON public.news_cache TO service_role;
GRANT SELECT ON public.imported_videos_backup TO service_role;
GRANT SELECT ON public.youtube_manga_videos_backup TO service_role;
