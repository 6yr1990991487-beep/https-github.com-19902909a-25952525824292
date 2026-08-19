#!/usr/bin/env bash
set -euo pipefail

# This script writes frontend/.env with VITE_ keys derived from available
# environment variables. It supports Lovable's fallback secret names
# (LOVABLE_SUPABASE_*) when direct SUPABASE_* names are not available.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_ENV_FILE="$ROOT_DIR/frontend/.env"

get() {
  name="$1"
  val=""
  # check direct SUPABASE_*
  val="${!name-}"
  if [ -n "$val" ]; then
    echo "$val"
    return
  fi
  # try LOVABLE_ prefixed alternative
  alt="LOVABLE_${name}"
  val="${!alt-}"
  if [ -n "$val" ]; then
    echo "$val"
    return
  fi
  # try VITE_ prefixed already present
  vite="VITE_${name#SUPABASE_}"
  val="${!vite-}"
  if [ -n "$val" ]; then
    echo "$val"
    return
  fi
  echo ""
}

mkdir -p "$(dirname "$FRONTEND_ENV_FILE")"

SUPABASE_URL_VAL=$(get "SUPABASE_URL")
SUPABASE_PROJECT_ID_VAL=$(get "SUPABASE_PROJECT_ID")
SUPABASE_PUBLISHABLE_KEY_VAL=$(get "SUPABASE_PUBLISHABLE_KEY")

if [ -z "$SUPABASE_URL_VAL" ] && [ -f "$FRONTEND_ENV_FILE" ]; then
  # nothing to do — keep existing .env
  exit 0
fi

echo "Writing $FRONTEND_ENV_FILE"
cat > "$FRONTEND_ENV_FILE" <<EOF
VITE_SUPABASE_URL="${SUPABASE_URL_VAL}"
VITE_SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID_VAL}"
VITE_SUPABASE_PUBLISHABLE_KEY="${SUPABASE_PUBLISHABLE_KEY_VAL}"
EOF

echo "Done."
