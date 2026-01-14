#!/usr/bin/env node

import { parseAllLogs } from './parser.js';
import { calculateBurnRate } from './calculator.js';
import { formatStats, formatStatusBar, formatCompact, formatJson } from './display.js';

type OutputFormat = 'full' | 'statusbar' | 'compact' | 'json';

function parseArgs(): { format: OutputFormat; hours: number } {
  const args = process.argv.slice(2);
  let format: OutputFormat = 'full';
  let hours = 5;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--statusbar' || arg === '-s') {
      format = 'statusbar';
    } else if (arg === '--compact' || arg === '-c') {
      format = 'compact';
    } else if (arg === '--json' || arg === '-j') {
      format = 'json';
    } else if (arg === '--hours' || arg === '-h') {
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        hours = parseInt(next, 10) || 5;
        i++;
      }
    } else if (arg === '--help') {
      console.log(`
cc-burn - Token usage tracking for Claude Code

Usage: cc-burn [options]

Options:
  --statusbar, -s   Output compact status bar format
  --compact, -c     Output single-line compact format
  --json, -j        Output raw JSON stats
  --hours <n>       Time window in hours (default: 5)
  --help            Show this help message

Examples:
  cc-burn                    Show full stats report
  cc-burn --statusbar        Show status bar format
  cc-burn --hours 24         Show stats for last 24 hours
`);
      process.exit(0);
    }
  }

  return { format, hours };
}

function main() {
  const { format, hours } = parseArgs();

  try {
    const events = parseAllLogs();
    const stats = calculateBurnRate(events, hours);

    switch (format) {
      case 'statusbar':
        console.log(formatStatusBar(stats));
        break;
      case 'compact':
        console.log(formatCompact(stats));
        break;
      case 'json':
        console.log(formatJson(stats));
        break;
      default:
        console.log(formatStats(stats));
    }
  } catch (error) {
    console.error('Error reading Claude logs:', error);
    process.exit(1);
  }
}

main();
