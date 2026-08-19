CREATE TABLE public.music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text,
  genre text NOT NULL DEFAULT 'ambiance',
  url text NOT NULL,
  duration_sec integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'upload',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.music_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;

ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published tracks" ON public.music_tracks
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins manage tracks" ON public.music_tracks
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER music_tracks_touch BEFORE UPDATE ON public.music_tracks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();