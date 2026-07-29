
CREATE TABLE public.youtube_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('video_id','keyword')),
  value text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, value)
);

GRANT SELECT ON public.youtube_blacklist TO anon;
GRANT SELECT ON public.youtube_blacklist TO authenticated;
GRANT ALL  ON public.youtube_blacklist TO service_role;

ALTER TABLE public.youtube_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blacklist"
ON public.youtube_blacklist FOR SELECT USING (true);

CREATE POLICY "Admins manage blacklist"
ON public.youtube_blacklist FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.youtube_manga_videos
  ADD COLUMN vision_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN vision_verdict text;
