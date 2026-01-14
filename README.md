# cc-burn

Token usage tracking and limit prediction for Claude Code.

**Stop hitting limits. Start shipping code.**

## Features

- Parse Claude Code logs from `~/.claude/projects/`
- Calculate real-time burn rate (tokens/minute)
- Estimate time remaining until 5-hour limit
- Track session cost based on model pricing
- Warning alerts at 80% and 95% usage

## Installation

```bash
# Clone the repository
git clone https://github.com/iam-dev/cc-burn.git
cd cc-burn

# Install dependencies
npm install

# Build
npm run build

# Run
node dist/cli.js
```

### Global Installation (npm)

```bash
npm install -g @iam-dev/cc-burn
cc-burn
```

## Usage

```bash
# Full stats report
cc-burn

# Status bar format (compact)
cc-burn --statusbar

# Single-line compact format
cc-burn --compact

# JSON output
cc-burn --json

# Custom time window (default: 5 hours)
cc-burn --hours 24
```

## Output Example

```
  Token Usage Report (last 5h)
  ════════════════════════════════════

  ████░░░░░░░░░░░░░░░░ 18%

  Tokens used:     8.1M / 45M
  Burn rate:       45K/min
  Time remaining:  ~13h 42m
  Session cost:    $2.47

  Breakdown:
    Input:         2.1M
    Output:        6.0M
    Cache read:    12.3M
    Cache create:  1.2M

  Model: claude-sonnet-4-20250514
  Events: 847 | Duration: 180m
```

## Alert Levels

| Level | Threshold | Action |
|-------|-----------|--------|
| Normal | < 80% | Safe to continue |
| Warning | 80-95% | Consider slowing down |
| Critical | > 95% | Take a break or compact context |

## Supported Models

| Model | 5-Hour Limit | Weekly Limit |
|-------|--------------|--------------|
| claude-sonnet-4 | ~45M tokens | ~200M tokens |
| claude-opus-4 | ~15M tokens | ~50M tokens |

*Limits are approximate estimates based on observed behavior.*

## Project Structure

```
cc-burn/
├── src/
│   ├── parser.ts      # Log file parser
│   ├── calculator.ts  # Burn rate calculations
│   ├── display.ts     # Output formatting
│   └── cli.ts         # CLI entry point
├── commands/
│   └── burn.md        # /burn command for Claude Code
├── hooks/
│   └── post-tool.sh   # Post-tool hook
└── .claude-plugin/
    └── manifest.json  # Plugin manifest
```

## Claude Code Plugin

cc-burn can be used as a Claude Code plugin:

1. Add to your Claude Code plugins directory
2. Use the `/burn` command to see stats

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Run locally
npm run burn
```

## License

MIT
