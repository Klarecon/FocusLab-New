#!/bin/bash
# FocusLab — Pre-commit gate hook for Claude Code
# Reads hook event JSON from stdin. If the command is a git commit,
# runs verify-done.sh and blocks on failure.
#
# Exit code 2 = hard block (Claude Code treats this as action denied)
# Exit code 0 = allow the action to proceed

set -uo pipefail

# Read the hook event JSON from stdin
input=$(cat)

# Extract the bash command being run
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Only gate git commit commands — let everything else through immediately
if ! echo "$command" | grep -q '^git commit'; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
VERIFY_SCRIPT="$PROJECT_DIR/.claude/hooks/verify-done.sh"

echo "Pre-commit gate triggered — running verification..." >&2

# Run the full verification suite
output=$(bash "$VERIFY_SCRIPT" 2>&1) && verify_exit=0 || verify_exit=1

if [ $verify_exit -ne 0 ]; then
  # Hard block — exit code 2 sends stderr to Claude as error message
  echo "" >&2
  echo "COMMIT BLOCKED — verification failed." >&2
  echo "" >&2
  echo "$output" >&2
  echo "" >&2
  echo "Fix the failures above before committing." >&2
  exit 2
fi

# All checks passed — allow the commit
exit 0
