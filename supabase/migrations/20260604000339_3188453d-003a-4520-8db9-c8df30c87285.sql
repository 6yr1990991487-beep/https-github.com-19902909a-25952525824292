CREATE TABLE public.imported_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('youtube','tiktok','prime')),
  external_id text,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  published_at timestamptz,
  episode text,
  position int NOT NULL DEFAULT 0,
  is_recent boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source, external_id)
);

GRANT SELECT ON public.imported_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.imported_videos TO authenticated;
GRANT ALL ON public.imported_videos TO service_role;

ALTER TABLE public.imported_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view imported videos"
  ON public.imported_videos FOR SELECT
  USING (true);

CREATE POLICY "Admins manage imported videos"
  ON public.imported_videos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER imported_videos_touch
  BEFORE UPDATE ON public.imported_videos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX imported_videos_source_published_idx
  ON public.imported_videos (source, published_at DESC);