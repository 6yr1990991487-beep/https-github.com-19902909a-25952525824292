Security remediation steps (urgent)

1) Immediate (execute now)
 - Revoke all currently used DB credentials, API keys, and any tokens that might be present in the repo or in CI/Lovable secrets (rotate Supabase service_role, anon, and any third-party API keys).
 - If a production DB backup was committed at any point, assume secrets/users are compromised and rotate passwords and tokens immediately.

2) Remove sensitive files from the working tree (we already removed present copy if any):
 - Locally: `git rm --cached extraction/raw/lovanet-fr_260714.backup` (if present) and commit the deletion.
 - Add `extraction/raw/*.backup` to `.gitignore` (already present in this repo).

3) Purge git history (required to fully remove the backup from all commits)
 - Preferred: use `git filter-repo` (faster & safer than filter-branch):
   - Install: `pip install git-filter-repo`
   - Run (from repo root):
     `git filter-repo --invert-paths --paths extraction/raw/lovanet-fr_260714.backup`
 - Alternative: use BFG Repo Cleaner.
 - After history rewrite: force-push branches and notify all collaborators to re-clone.

4) Rotate credentials & secrets
 - Generate new Supabase `service_role` key, revoke old keys.
 - Rotate any third-party API keys (Google, YouTube, translation services, etc.).
 - Update Lovable/CI secrets with new values.

5) Add detection and prevention
 - Add a GitHub Action to scan for secrets and large backups on PRs (example: `trufflehog`, `detect-secrets`, or builtin checks).
 - Add a pre-commit hook to block .backup files and AWS keys (`.git/hooks/pre-commit` or use `pre-commit` package with `detect-secrets` plugin).

6) Tighten server-side protections (we applied initial patches)
 - Require `SYNC_SECRET` for expensive endpoints (translate, multilingual trailers).
 - Add rate-limiting on public endpoints as needed (Cloudflare, Lovable platform, or in-app token bucket).
 - Ensure image-proxy blocks private IP ranges and has a host allowlist (already present in backend / supabase functions).

7) Incident response
 - Assume user credentials and tokens may be compromised — force password resets for admin accounts.
 - Notify affected users if PII was exposed (legal requirement depending on jurisdiction).

If you want, I can:
 - Generate the exact `git filter-repo` command and help perform the history purge (this requires force push and coordination).
 - Create CI workflow stubs for secret scanning and PR blocking.
