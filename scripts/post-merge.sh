#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Push to GitHub backup repo
if [ -n "$GITHUB_TOKEN" ]; then
  REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/vineettalwar/FM5.0.git"
  # Use a ephemeral remote so the token is never persisted in git config
  git push "$REMOTE_URL" HEAD:main
  echo "GitHub sync complete."
else
  echo "GITHUB_TOKEN not set — skipping GitHub sync."
fi
