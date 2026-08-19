#!/usr/bin/env bash
set -euo pipefail

echo "[write-env-from-secrets] Creating .env from build-time secrets..."

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_PROJECT_ID:-}" ] || [ -z "${SUPABASE_PUBLISHABLE_KEY:-}" ]; then
  echo "Error: SUPABASE_URL, SUPABASE_PROJECT_ID and SUPABASE_PUBLISHABLE_KEY must be provided as Secrets or env vars." >&2
  exit 1
fi

cat > .env <<EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}

# Optional runtime/server secrets (keep for server functions)
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}
SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
SYNC_SECRET=${SYNC_SECRET:-}
LOVABLE_API_KEY=${LOVABLE_API_KEY:-}
EOF

echo "[write-env-from-secrets] .env written (VITE_ variables injected)."

exit 0
