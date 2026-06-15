#!/bin/bash
# FocusLab — Automated verification gate
# Runs all Definition of Done checks. Exit 0 = pass, Exit 1 = fail.
# Called by pre-commit hook and can be run standalone: bash .claude/hooks/verify-done.sh
#
# To add new checks: just append another check_* block below.
# Turn every repeated miss into a check here so it never happens again.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$PROJECT_DIR"

PASS=0
FAIL=0
FAILURES=""

report() {
  local label="$1"
  local exit_code="$2"
  local detail="$3"
  if [ "$exit_code" -eq 0 ]; then
    PASS=$((PASS + 1))
    echo "  PASS  $label"
  else
    FAIL=$((FAIL + 1))
    FAILURES="${FAILURES}\n  FAIL  $label: $detail"
    echo "  FAIL  $label: $detail"
  fi
}

echo "=== FocusLab Verification Gate ==="
echo ""

# --- Check 1: TypeScript compilation ---
tsc_output=$(npx tsc --noEmit 2>&1) && tsc_exit=0 || tsc_exit=1
if [ $tsc_exit -eq 0 ]; then
  report "TypeScript (tsc --noEmit)" 0 ""
else
  error_count=$(echo "$tsc_output" | grep -c "error TS" || true)
  report "TypeScript (tsc --noEmit)" 1 "${error_count} type errors"
fi

# --- Check 2: Tests pass ---
test_output=$(npx vitest --run 2>&1) && test_exit=0 || test_exit=1
if [ $test_exit -eq 0 ]; then
  test_count=$(echo "$test_output" | grep -oE '[0-9]+ passed' | head -1 || echo "? passed")
  report "Vitest ($test_count)" 0 ""
else
  failed_count=$(echo "$test_output" | grep -oE '[0-9]+ failed' | head -1 || echo "? failed")
  report "Vitest" 1 "$failed_count"
fi

# --- Check 3: No banned colors ---
banned_grep=$(grep -r --include='*.ts' --include='*.tsx' --exclude='*.test.*' "29,107,88\|df3c18\|b9852b\|185,133,43\|5c544a" src/ 2>/dev/null || true)
if [ -z "$banned_grep" ]; then
  report "No banned colors" 0 ""
else
  hit_count=$(echo "$banned_grep" | wc -l | tr -d ' ')
  report "No banned colors" 1 "${hit_count} occurrences found"
fi

# --- Check 4: No window.__ hacks ---
window_grep=$(grep -r --exclude='*.test.*' "window\.__" src/ 2>/dev/null || true)
if [ -z "$window_grep" ]; then
  report "No window.__ globals" 0 ""
else
  hit_count=$(echo "$window_grep" | wc -l | tr -d ' ')
  report "No window.__ globals" 1 "${hit_count} occurrences found"
fi

# --- Check 5: No Hanken Grotesk ---
hanken_grep=$(grep -ri --exclude='*.test.*' "hanken" src/ 2>/dev/null || true)
if [ -z "$hanken_grep" ]; then
  report "No Hanken Grotesk" 0 ""
else
  report "No Hanken Grotesk" 1 "found in source files"
fi

# --- Check 6: No corporate emoji in components ---
# Checks src/components/ for the banned corporate emoji set
corp_emoji=$(grep -rP '📊|📋|✅|📈|🚀|💡' src/components/ 2>/dev/null || true)
if [ -z "$corp_emoji" ]; then
  report "No corporate emoji" 0 ""
else
  hit_count=$(echo "$corp_emoji" | wc -l | tr -d ' ')
  report "No corporate emoji" 1 "${hit_count} occurrences in components"
fi

# --- Check 7: No green success states (rgba green in components) ---
green_success=$(grep -rE --exclude='*.test.*' "rgb[a]?\(29,\s*107,\s*88|text-green-|bg-green-|border-green-" src/components/ 2>/dev/null || true)
if [ -z "$green_success" ]; then
  report "No green success states" 0 ""
else
  report "No green success states" 1 "green used for success/selected states"
fi

# --- Check 8: SCORE_FROM_LEVEL uses correct values (2/3/4 not 1/2/3) ---
score_file="src/lib/engine/solutions-logic.ts"
if [ -f "$score_file" ]; then
  # Check that low=2, med=3, high=4 exists
  if grep -qE "low.*[=:].*2" "$score_file" && grep -qE "med.*[=:].*3" "$score_file" && grep -qE "high.*[=:].*4" "$score_file"; then
    report "SCORE_FROM_LEVEL (2/3/4)" 0 ""
  else
    report "SCORE_FROM_LEVEL (2/3/4)" 1 "mapping may have regressed — check solutions-logic.ts"
  fi
else
  report "SCORE_FROM_LEVEL (2/3/4)" 1 "solutions-logic.ts not found"
fi

# ============================================
# ADD NEW CHECKS ABOVE THIS LINE
# Each repeated miss becomes a permanent check.
# ============================================

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Failures:"
  echo -e "$FAILURES"
  echo ""
  exit 1
else
  echo "All checks passed."
  # Timestamp this run so the stop-hook knows verification happened
  date +%s > /tmp/focuslab-verify-last-run
  exit 0
fi
