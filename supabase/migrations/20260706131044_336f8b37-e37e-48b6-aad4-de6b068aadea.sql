
CREATE TABLE public.youtube_manga_videos (
  video_id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail text,
  channel_title text,
  published_at timestamptz NOT NULL,
  duration_sec integer NOT NULL DEFAULT 0,
  view_count bigint NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youtube_manga_videos TO anon;
GRANT SELECT ON public.youtube_manga_videos TO authenticated;
GRANT ALL  ON public.youtube_manga_videos TO service_role;

ALTER TABLE public.youtube_manga_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible youtube manga videos"
ON public.youtube_manga_videos FOR SELECT
USING (is_hidden = false);

CREATE POLICY "Admins manage youtube manga videos"
ON public.youtube_manga_videos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX youtube_manga_videos_published_at_idx
  ON public.youtube_manga_videos (published_at ASC);

CREATE TRIGGER youtube_manga_videos_touch
BEFORE UPDATE ON public.youtube_manga_videos
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


CREATE TABLE public.youtube_sync_state (
  key text PRIMARY KEY,
  last_published_at timestamptz,
  last_run_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youtube_sync_state TO anon;
GRANT SELECT ON public.youtube_sync_state TO authenticated;
GRANT ALL  ON public.youtube_sync_state TO service_role;

ALTER TABLE public.youtube_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sync state"
ON public.youtube_sync_state FOR SELECT USING (true);

CREATE POLICY "Admins manage sync state"
ON public.youtube_sync_state FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER youtube_sync_state_touch
BEFORE UPDATE ON public.youtube_sync_state
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
