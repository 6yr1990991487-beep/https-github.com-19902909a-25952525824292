create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.imported_videos_backup (
  like public.imported_videos including all,
  backed_up_at timestamptz not null default now()
);
grant select on public.imported_videos_backup to authenticated;
grant all on public.imported_videos_backup to service_role;
alter table public.imported_videos_backup enable row level security;
drop policy if exists "admin read imported_videos_backup" on public.imported_videos_backup;
create policy "admin read imported_videos_backup"
  on public.imported_videos_backup for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public._imported_videos_backup_trg()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.imported_videos_backup select (new).*, now();
  return new;
end;
$$;

drop trigger if exists trg_imported_videos_backup on public.imported_videos;
create trigger trg_imported_videos_backup
  after insert or update on public.imported_videos
  for each row execute function public._imported_videos_backup_trg();

create table if not exists public.youtube_manga_videos_backup (
  like public.youtube_manga_videos including all,
  backed_up_at timestamptz not null default now()
);
grant select on public.youtube_manga_videos_backup to authenticated;
grant all on public.youtube_manga_videos_backup to service_role;
alter table public.youtube_manga_videos_backup enable row level security;
drop policy if exists "admin read ymv_backup" on public.youtube_manga_videos_backup;
create policy "admin read ymv_backup"
  on public.youtube_manga_videos_backup for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public._ymv_backup_trg()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.youtube_manga_videos_backup select (new).*, now();
  return new;
end;
$$;

drop trigger if exists trg_ymv_backup on public.youtube_manga_videos;
create trigger trg_ymv_backup
  after insert or update on public.youtube_manga_videos
  for each row execute function public._ymv_backup_trg();

-- NOTE: The following cron scheduling block previously embedded a project
-- anon key directly in the migration. Storing secrets in repository history is
-- unsafe. If you need to schedule these cron jobs, run equivalent SQL via a
-- secure deploy-time process and supply the anon key from a secrets manager.

-- Example (to be run outside of repo with a real key):
-- perform cron.schedule('lovanet-sync-videos', '*/30 * * * *', format($f$
--   select net.http_post(url := '%s/functions/v1/sync-videos',
--     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer %s'),
--     body := '{}'::jsonb);
-- $f$, project_url, ANON_KEY));