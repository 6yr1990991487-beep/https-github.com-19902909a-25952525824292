
CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA internal TO postgres, service_role;

CREATE OR REPLACE FUNCTION internal.sync_secret_header()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = internal, vault
AS $$
DECLARE v text;
BEGIN
  SELECT decrypted_secret INTO v FROM vault.decrypted_secrets WHERE name = 'SYNC_SECRET' LIMIT 1;
  RETURN v;
END;
$$;

REVOKE ALL ON FUNCTION internal.sync_secret_header() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION internal.sync_secret_header() TO postgres, service_role;

DROP FUNCTION IF EXISTS public._sync_secret_header();

-- Repoint cron to internal.sync_secret_header
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
      'x-sync-secret', internal.sync_secret_header()
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
      'x-sync-secret', internal.sync_secret_header()
    ),
    body := jsonb_build_object('scheduled_at', now(), 'source', 'cron-5min')
  );
  $cmd$
);
