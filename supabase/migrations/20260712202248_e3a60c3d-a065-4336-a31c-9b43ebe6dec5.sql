-- The `_backup` tables shadow the live table and record every mutation via a
-- trigger. Their PK on `id` collides on the 2nd write for the same row (any
-- UPDATE / repeated upsert), which breaks sync-videos in full mode. Replace
-- the PK with a surrogate so history rows can co-exist per source id.

ALTER TABLE public.imported_videos_backup DROP CONSTRAINT IF EXISTS imported_videos_backup_pkey;
ALTER TABLE public.imported_videos_backup DROP CONSTRAINT IF EXISTS imported_videos_backup_source_external_id_key;
ALTER TABLE public.imported_videos_backup ADD COLUMN IF NOT EXISTS backup_id bigserial;
ALTER TABLE public.imported_videos_backup ADD CONSTRAINT imported_videos_backup_pkey PRIMARY KEY (backup_id);

ALTER TABLE public.youtube_manga_videos_backup DROP CONSTRAINT IF EXISTS youtube_manga_videos_backup_pkey;
ALTER TABLE public.youtube_manga_videos_backup DROP CONSTRAINT IF EXISTS youtube_manga_videos_backup_video_id_key;
ALTER TABLE public.youtube_manga_videos_backup ADD COLUMN IF NOT EXISTS backup_id bigserial;
ALTER TABLE public.youtube_manga_videos_backup ADD CONSTRAINT youtube_manga_videos_backup_pkey PRIMARY KEY (backup_id);