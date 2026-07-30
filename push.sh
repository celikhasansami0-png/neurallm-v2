#!/bin/bash
set -e
cd "$(dirname "$0")"

# Remove stale git lock if present
rm -f .git/index.lock .git/HEAD.lock

# Stage new files
git add app/api/webhooks/clerk/route.ts
git add package.json

# Commit
git commit -m "feat: Resend welcome email + Clerk webhook handler"

# Push
git push

echo ""
echo "✅ Push complete! Vercel will deploy automatically."
