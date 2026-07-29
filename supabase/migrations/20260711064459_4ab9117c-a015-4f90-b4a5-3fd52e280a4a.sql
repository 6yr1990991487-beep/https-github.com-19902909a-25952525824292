-- Remove public SELECT on moderation/internal tables. The existing
-- "Admins manage ..." ALL policies already cover admin reads via has_role().
DROP POLICY IF EXISTS "Public read blacklist" ON public.youtube_blacklist;
DROP POLICY IF EXISTS "Public read sync state" ON public.youtube_sync_state;

-- Revoke anon SELECT grants to match the tightened policies.
REVOKE SELECT ON public.youtube_blacklist FROM anon;
REVOKE SELECT ON public.youtube_sync_state FROM anon;