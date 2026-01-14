---
name: burn
description: Show token usage stats and time remaining until limit
---

# Token Usage Report

Run the cc-burn CLI to display current token usage statistics.

## Instructions

Execute the cc-burn CLI tool to get token usage stats:

```bash
node dist/cli.js
```

Display the output to the user exactly as returned.

## Quick Reference

- **Tokens used**: Total tokens consumed in the last 5 hours
- **Burn rate**: Average tokens per minute based on session activity
- **Time remaining**: Estimated time until hitting the 5-hour limit
- **Session cost**: Approximate API cost if tokens were billed directly

## Alert Levels

- **Normal** (< 80%): Safe to continue
- **Warning** (80-95%): Consider slowing down or compacting context
- **Critical** (> 95%): Near limit, take a break or compact immediately
