#!/bin/bash
# Post-tool hook to update status bar after each tool use
# This can be used to display token usage in the status bar

SCRIPT_DIR="$(dirname "$0")"
node "$SCRIPT_DIR/../dist/cli.js" --statusbar 2>/dev/null || true
