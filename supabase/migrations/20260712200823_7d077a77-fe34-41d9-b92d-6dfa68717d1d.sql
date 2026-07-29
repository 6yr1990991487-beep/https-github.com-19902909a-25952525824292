
-- Security-definer helper: return the current SYNC_SECRET from Supabase Vault.
-- Restricted to postgres/service role so pg_cron can call it but the anon key
-- (which is public in the client) cannot exfiltrate it via PostgREST.
CREATE OR REPLACE FUNCTION public._sync_secret_header()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v text;
BEGIN
  SELECT decrypted_secret INTO v
  FROM vault.decrypted_secrets
  WHERE name = 'SYNC_SECRET'
  LIMIT 1;
  RETURN v;
END;
$$;

REVOKE ALL ON FUNCTION public._sync_secret_header() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._sync_secret_header() TO postgres, service_role;

-- Recreate the cron jobs so they pass the shared secret header
SELECT cron.unschedule('lovanet-sync-videos-5min');
SELECT cron.unschedule('lovanet-youtube-anime-sync-5min');

SELECT cron.schedule(
  'lovanet-sync-videos-5min',
  '*/5 * * * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://pvgfxzzwuhjhfqsiylpr.supabase.co/functions/v1/sync-videos',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2Z4enp3dWhqaGZxc2l5bHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjkzNzgsImV4cCI6MjA4NzcwNTM3OH0.1et7WeiRnOKbqTLamK4M01Ac2OFC_v1r6LqFg5goga0',
      'x-sync-secret', public._sync_secret_header()
    ),
    body := jsonb_build_object('triggered_at', now(), 'source', 'cron-5min')
  );
  $cmd$
);

SELECT cron.schedule(
  'lovanet-youtube-anime-sync-5min',
  '*/5 * * * *',
  $cmd$
  SELECT net.http_post(
    url := 'https://pvgfxzzwuhjhfqsiylpr.supabase.co/functions/v1/youtube-anime-sync',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z2Z4enp3dWhqaGZxc2l5bHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjkzNzgsImV4cCI6MjA4NzcwNTM3OH0.1et7WeiRnOKbqTLamK4M01Ac2OFC_v1r6LqFg5goga0',
      'x-sync-secret', public._sync_secret_header()
    ),
    body := jsonb_build_object('scheduled_at', now(), 'source', 'cron-5min')
  );
  $cmd$
);
