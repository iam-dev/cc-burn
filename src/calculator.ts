import { TokenEvent, getRecentEvents } from './parser.js';

export interface ModelLimits {
  fiveHourLimit: number;
  weeklyLimit: number;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
}

export interface BurnStats {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  tokensPerMinute: number;
  estimatedTimeRemaining: string;
  minutesRemaining: number;
  percentUsed: number;
  sessionCost: number;
  model: string;
  limit: number;
  eventCount: number;
  sessionDurationMinutes: number;
}

// Known limits (approximate - Anthropic doesn't publish exact numbers)
export const MODEL_LIMITS: Record<string, ModelLimits> = {
  'claude-sonnet-4-20250514': {
    fiveHourLimit: 45_000_000,
    weeklyLimit: 200_000_000,
    inputCostPerMillion: 3,
    outputCostPerMillion: 15,
  },
  'claude-sonnet-4': {
    fiveHourLimit: 45_000_000,
    weeklyLimit: 200_000_000,
    inputCostPerMillion: 3,
    outputCostPerMillion: 15,
  },
  'claude-opus-4-20250514': {
    fiveHourLimit: 15_000_000,
    weeklyLimit: 50_000_000,
    inputCostPerMillion: 15,
    outputCostPerMillion: 75,
  },
  'claude-opus-4': {
    fiveHourLimit: 15_000_000,
    weeklyLimit: 50_000_000,
    inputCostPerMillion: 15,
    outputCostPerMillion: 75,
  },
  'claude-opus-4-5-20251101': {
    fiveHourLimit: 15_000_000,
    weeklyLimit: 50_000_000,
    inputCostPerMillion: 15,
    outputCostPerMillion: 75,
  },
};

const DEFAULT_LIMITS: ModelLimits = {
  fiveHourLimit: 45_000_000,
  weeklyLimit: 200_000_000,
  inputCostPerMillion: 3,
  outputCostPerMillion: 15,
};

export function formatDuration(minutes: number): string {
  if (!isFinite(minutes) || minutes < 0) {
    return '∞';
  }

  if (minutes < 1) {
    return '< 1m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}m`;
  }

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return `${hours}h ${mins}m`;
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function getModelLimits(model: string): ModelLimits {
  // Try exact match first
  if (MODEL_LIMITS[model]) {
    return MODEL_LIMITS[model];
  }

  // Try partial match
  for (const [key, limits] of Object.entries(MODEL_LIMITS)) {
    if (model.includes(key) || key.includes(model)) {
      return limits;
    }
  }

  // Check if it's an opus model
  if (model.toLowerCase().includes('opus')) {
    return MODEL_LIMITS['claude-opus-4'];
  }

  return DEFAULT_LIMITS;
}

export function calculateCost(events: TokenEvent[], limits: ModelLimits): number {
  const totalInput = events.reduce((sum, e) => sum + e.inputTokens, 0);
  const totalOutput = events.reduce((sum, e) => sum + e.outputTokens, 0);

  const inputCost = (totalInput / 1_000_000) * limits.inputCostPerMillion;
  const outputCost = (totalOutput / 1_000_000) * limits.outputCostPerMillion;

  return inputCost + outputCost;
}

export function calculateBurnRate(allEvents: TokenEvent[], hoursWindow: number = 5): BurnStats {
  const events = getRecentEvents(allEvents, hoursWindow);

  if (events.length === 0) {
    return {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      tokensPerMinute: 0,
      estimatedTimeRemaining: '∞',
      minutesRemaining: Infinity,
      percentUsed: 0,
      sessionCost: 0,
      model: 'unknown',
      limit: DEFAULT_LIMITS.fiveHourLimit,
      eventCount: 0,
      sessionDurationMinutes: 0,
    };
  }

  const inputTokens = events.reduce((sum, e) => sum + e.inputTokens, 0);
  const outputTokens = events.reduce((sum, e) => sum + e.outputTokens, 0);
  const cacheReadTokens = events.reduce((sum, e) => sum + e.cacheReadTokens, 0);
  const cacheCreationTokens = events.reduce((sum, e) => sum + e.cacheCreationTokens, 0);
  const totalTokens = inputTokens + outputTokens;

  // Calculate session duration
  const firstTimestamp = new Date(events[0].timestamp).getTime();
  const lastTimestamp = new Date(events[events.length - 1].timestamp).getTime();
  const sessionDurationMs = lastTimestamp - firstTimestamp;
  const sessionDurationMinutes = Math.max(sessionDurationMs / 60000, 1);

  // Tokens per minute
  const tokensPerMinute = totalTokens / sessionDurationMinutes;

  // Get model from most recent event
  const model = events[events.length - 1].model;
  const limits = getModelLimits(model);
  const limit = limits.fiveHourLimit;

  // Calculate remaining time
  const remaining = limit - totalTokens;
  const minutesRemaining = tokensPerMinute > 0 ? remaining / tokensPerMinute : Infinity;

  // Calculate percentage used
  const percentUsed = Math.round((totalTokens / limit) * 100);

  // Calculate cost
  const sessionCost = calculateCost(events, limits);

  return {
    totalTokens,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheCreationTokens,
    tokensPerMinute: Math.round(tokensPerMinute),
    estimatedTimeRemaining: formatDuration(minutesRemaining),
    minutesRemaining,
    percentUsed,
    sessionCost,
    model,
    limit,
    eventCount: events.length,
    sessionDurationMinutes: Math.round(sessionDurationMinutes),
  };
}
