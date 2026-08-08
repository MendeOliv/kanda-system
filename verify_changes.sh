#!/usr/bin/env bash
set -e

echo "=== Verifying TypeScript for changed frontend files ==="
cd "/c/Users/UTILIZADOR/kanda-system/frontend"
OUTPUT=$(npx tsc --noEmit 2>&1)
echo "$OUTPUT" | grep -E "src/(middleware|i18n|app/layout)\.(ts|tsx)|src/messages/pt-AO\.json" || true
if [ $? -eq 0 ]; then
    echo "TypeScript errors found in changed files (see above)."
else
    echo "No TypeScript errors in changed frontend files."
fi

echo ""
echo "=== Checking backend TypeScript (no changes in this turn) ==="
cd "/c/Users/UTILIZADOR/kanda-system/backend"
OUTPUT2=$(npx tsc --noEmit 2>&1)
echo "$OUTPUT2" | grep -E ": error TS" || true
if [ $? -eq 0 ]; then
    echo "Backend TypeScript errors (see above)."
else
    echo "Backend TypeScript check passed (no errors)."
fi

echo ""
echo "Verification complete."