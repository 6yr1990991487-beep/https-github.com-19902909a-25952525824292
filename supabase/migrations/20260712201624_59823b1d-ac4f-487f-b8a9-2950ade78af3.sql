CREATE OR REPLACE FUNCTION public.sync_secret_header_value()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public','vault'
AS $$
DECLARE v text;
BEGIN
  SELECT decrypted_secret INTO v FROM vault.decrypted_secrets WHERE name='SYNC_SECRET' LIMIT 1;
  RETURN v;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_secret_header_value() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_secret_header_value() TO service_role;