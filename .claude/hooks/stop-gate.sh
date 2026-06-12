#!/bin/bash
# FocusLab — Stop hook
# Fires when Claude finishes a response. Checks whether verify-done.sh
# was run this turn. If not, reminds Claude it can't declare "done"
# without running verification.
#
# This is a soft gate (exit 0 with message) — it doesn't block Claude
# from responding, but injects a reminder that becomes part of the
# conversation context so Claude has to address it.

set -uo pipefail

input=$(cat)

# Extract the last assistant message to check if Claude is declaring "done"
# We check the transcript for signs of completion claims
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty' 2>/dev/null)

if [ -z "$transcript_path" ] || [ ! -f "$transcript_path" ]; then
  exit 0
fi

# Look at Claude's last message for "done" signals
last_message=$(tail -c 5000 "$transcript_path" 2>/dev/null || true)

# Check for completion language
if echo "$last_message" | grep -qiE '(all done|completed|finished|everything.*(pass|done|fixed)|gate passed|declaring done|done\.)'; then

  PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

  # Check if verify-done.sh was actually run recently (within last 2 minutes)
  verify_log="/tmp/focuslab-verify-last-run"
  if [ -f "$verify_log" ]; then
    last_run=$(cat "$verify_log")
    now=$(date +%s)
    diff=$((now - last_run))
    if [ "$diff" -lt 120 ]; then
      # Verification was run recently, allow it
      exit 0
    fi
  fi

  # Verification wasn't run — remind Claude
  echo "STOP CHECK: You're declaring done but verify-done.sh hasn't been run this turn. Run 'bash .claude/hooks/verify-done.sh' and report results before finishing." >&2
  exit 0
fi

exit 0
