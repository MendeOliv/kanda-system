#!/usr/bin/env bash
set -e

FRONTEND_DIR="/c/Users/UTILIZADOR/kanda-system/frontend"
BACKEND_DIR="/c/Users/UTILIZADOR/kanda-system/backend"

echo "=== Checking frontend TypeScript ==="
cd "$FRONTEND_DIR"
OUTPUT=$(npx tsc --noEmit 2>&1)
echo "$OUTPUT" | grep -E "src/(m|i18n|app/layout|m)/.*\.(ts|tsx|json)" || true
if [ $? -eq 0 ]; then
    echo "TypeScript errors found in frontend changed files (see above)."
else
    echo "No TypeScript errors found in frontend changed files."
fi

echo ""
echo "=== Checking backend TypeScript ==="
cd "$BACKEND_DIR"
OUTPUT=$(npx tsc --noEmit 2>&1)
echo "$OUTPUT" | grep -E "src/.*\.(ts)" || true
if [ $? -eq 0 ]; then
    echo "TypeScript errors found in backend (see above)."
else
    echo "No TypeScript errors found in backend."
fi