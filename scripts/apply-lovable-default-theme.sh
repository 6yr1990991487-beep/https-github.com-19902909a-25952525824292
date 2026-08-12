#!/usr/bin/env bash
set -euo pipefail

# Script to enforce the Lovable default theme in this repository.
# Usage: bash scripts/apply-lovable-default-theme.sh [branch]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-conflict_290726_1841}"
THEME_ID="mint-vibrant-cyber"

FILES=(
  "$ROOT_DIR/src/components/ThemeBubble.tsx"
  "$ROOT_DIR/frontend/src/components/ThemeBubble.tsx"
)

echo "Using branch: $BRANCH"
cd "$ROOT_DIR"

if ! git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  echo "Branch '$BRANCH' does not exist locally. Fetching from origin..."
  git fetch origin "$BRANCH":"$BRANCH"
fi

git checkout "$BRANCH"

git_status_changed=false

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Updating theme default in $file"
    if grep -q 'DEFAULT_THEME_ID = "'$THEME_ID'"' "$file"; then
      echo "  Already set to $THEME_ID"
    else
      perl -pi -e 's/DEFAULT_THEME_ID = \"[^\"]*\";/DEFAULT_THEME_ID = "'$THEME_ID'";/' "$file"
      git add "$file"
      git_status_changed=true
    fi
  else
    echo "  File not found, skipping: $file"
  fi
done

if [[ "$git_status_changed" == true ]]; then
  git commit -m "Apply Lovable default theme: $THEME_ID"
  git push origin "$BRANCH"
  echo "Committed and pushed changes to branch $BRANCH."
else
  echo "No changes needed. Theme already set to $THEME_ID in available files."
fi

echo "Done. If you need to publish from Lovable, use branch $BRANCH."
