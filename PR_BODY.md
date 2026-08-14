Title: Security + Build fixes: Harden image proxy and fix RootLandingPage build

Summary:
- Hardened edge image proxy to prevent SSRF and limit resource usage.
  - Uses `ALLOWED_ORIGIN` env var (default https://lovanet.fr) instead of wildcard CORS.
  - Validates `Origin`/`Referer` or requires `SYNC_SECRET` for server calls.
  - Enforces `MAX_IMAGE_BYTES` (default 5MB) and blocks private host targets.
- Fixed a build failure in `RootLandingPage.jsx` by replacing a TypeScript-style cast with a JSDoc cast compatible with `.jsx`.
- Verified `npm run build` completes successfully and `dist/` is produced.

Files changed:
- `supabase/functions/api/index.ts` — proxy hardening and CORS change
- `src/pages/RootLandingPage.jsx` — build fix

Why this PR:
- These fixes resolve the immediate blockers preventing a clean production build and remove an SSRF attack surface used by the public image proxy.
- The fixes are intentionally minimal and isolated so they can be reviewed and merged quickly.

Build verification steps (already executed here):
```bash
npm ci --no-audit --no-fund
npm run build
```

Recommended follow-ups (NOT included in this PR but strongly recommended to perform immediately after merge):
1. Purge backups/dumps from Git history (destructive rewrite). Example using `git-filter-repo`:
```bash
pip install git-filter-repo
git filter-repo --invert-paths --paths backups/ --paths extraction/raw/lovanet-fr_260714.backup
# then force-push and coordinate with the team
git push --force origin main
```
2. Rotate secrets potentially exposed in repo/migrations: `SUPABASE_SERVICE_ROLE_KEY`, `SYNC_SECRET`, `GOOGLE_API_KEY`, `LOVABLE_API_KEY`, any anon API keys present in migrations. Update deployment envs accordingly.
3. Apply the security migration to remove public access to `news_cache` and backup tables if not already applied (see `supabase/migrations/20260813123500_fix_security_backup_and_news_cache.sql`).
4. Add monitoring/rate-limiting to public endpoints (image proxy, translate, yt scrape) to protect external API quotas.

Checklist for Lovable to merge:
- [ ] Review security patch in `supabase/functions/api/index.ts`
- [ ] Confirm `ALLOWED_ORIGIN` value and set it in production envs
- [ ] Run build in CI and confirm artifacts
- [ ] Plan/coordinate git history purge and secret rotations with the team

If you want I can:
- Perform the git history purge now (requires force-push and team coordination).
- Scan the repo for remaining secrets and prepare a rotation plan.
- Apply the RLS migration via your DB migration workflow.

PR branch: `lovable/security-fix-build`
Create PR URL: https://github.com/lijk7677-dev/lovanet-fr-1052d9fc/pull/new/lovable/security-fix-build
