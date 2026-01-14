import { BurnStats, formatTokenCount } from './calculator.js';

export type AlertLevel = 'normal' | 'warning' | 'critical';

export function getAlertLevel(percentUsed: number): AlertLevel {
  if (percentUsed >= 95) return 'critical';
  if (percentUsed >= 80) return 'warning';
  return 'normal';
}

export function getProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return bar;
}

export function formatStats(stats: BurnStats): string {
  const alertLevel = getAlertLevel(stats.percentUsed);

  const lines: string[] = [];

  // Header
  lines.push('');
  lines.push('  Token Usage Report (last 5h)');
  lines.push('  ════════════════════════════════════');
  lines.push('');

  // Progress bar
  const bar = getProgressBar(stats.percentUsed);
  lines.push(`  ${bar} ${stats.percentUsed}%`);
  lines.push('');

  // Stats table
  const tokensUsed = formatTokenCount(stats.totalTokens);
  const limit = formatTokenCount(stats.limit);
  lines.push(`  Tokens used:     ${tokensUsed} / ${limit}`);
  lines.push(`  Burn rate:       ${formatTokenCount(stats.tokensPerMinute)}/min`);
  lines.push(`  Time remaining:  ~${stats.estimatedTimeRemaining}`);
  lines.push(`  Session cost:    $${stats.sessionCost.toFixed(2)}`);
  lines.push('');

  // Breakdown
  lines.push('  Breakdown:');
  lines.push(`    Input:         ${formatTokenCount(stats.inputTokens)}`);
  lines.push(`    Output:        ${formatTokenCount(stats.outputTokens)}`);
  lines.push(`    Cache read:    ${formatTokenCount(stats.cacheReadTokens)}`);
  lines.push(`    Cache create:  ${formatTokenCount(stats.cacheCreationTokens)}`);
  lines.push('');

  // Model and session info
  lines.push(`  Model: ${stats.model}`);
  lines.push(`  Events: ${stats.eventCount} | Duration: ${stats.sessionDurationMinutes}m`);
  lines.push('');

  // Alerts
  if (alertLevel === 'critical') {
    lines.push('  !! CRITICAL: Above 95% of limit !!');
    lines.push('  Consider compacting context or taking a break.');
    lines.push('');
  } else if (alertLevel === 'warning') {
    lines.push('  ! WARNING: Above 80% of limit');
    lines.push(`  At current rate, you'll hit limit in ~${stats.estimatedTimeRemaining}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function formatStatusBar(stats: BurnStats): string {
  const tokensUsed = formatTokenCount(stats.totalTokens);
  const alertLevel = getAlertLevel(stats.percentUsed);

  let prefix = '';
  if (alertLevel === 'critical') prefix = '!!';
  else if (alertLevel === 'warning') prefix = '!';

  return `${prefix}${tokensUsed} (${stats.percentUsed}%) ~${stats.estimatedTimeRemaining}`;
}

export function formatCompact(stats: BurnStats): string {
  const tokensUsed = formatTokenCount(stats.totalTokens);
  const limit = formatTokenCount(stats.limit);

  return `${tokensUsed}/${limit} (${stats.percentUsed}%) | ${formatTokenCount(stats.tokensPerMinute)}/min | ~${stats.estimatedTimeRemaining} remaining | $${stats.sessionCost.toFixed(2)}`;
}

export function formatJson(stats: BurnStats): string {
  return JSON.stringify(stats, null, 2);
}
