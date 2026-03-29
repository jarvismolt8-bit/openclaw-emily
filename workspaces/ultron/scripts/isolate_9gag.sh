#!/bin/bash
set -e

PROFILE="vnc"

# Open 9gag
openclaw browser --browser-profile "$PROFILE" open https://9gag.com 2>&1

# Get the new tab ID (the last opened, typically at the end)
NEW_TAB_ID=$(openclaw browser tabs --browser-profile "$PROFILE" 2>&1 | awk '/^[0-9]+\./ {id=$3} END {print id}')

echo "New 9GAG tab ID: $NEW_TAB_ID"

# Sleep briefly to ensure tab is fully registered
sleep 1

# List all tabs and close any that don't contain '9gag'
openclaw browser tabs --browser-profile "$PROFILE" 2>&1 | while read -r line; do
  if echo "$line" | grep -qi 9gag; then
    echo "Keeping tab: $line"
  else
    # Extract tab ID (third field in "X. Title ... id: <ID>")
    TAB_ID=$(echo "$line" | grep -o 'id: [A-F0-9]*' | cut -d' ' -f2)
    if [ -n "$TAB_ID" ] && [ "$TAB_ID" != "$NEW_TAB_ID" ]; then
      echo "Closing tab ID: $TAB_ID"
      openclaw browser close "$TAB_ID" --browser-profile "$PROFILE" 2>&1 || true
    fi
  fi
done

echo "Done. Current tabs:"
openclaw browser tabs --browser-profile "$PROFILE" 2>&1 | head -10