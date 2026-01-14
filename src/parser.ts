import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface TokenEvent {
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  model: string;
  sessionId: string;
}

interface LogEntry {
  type: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
  message?: {
    role: string;
    model?: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
}

export function getClaudeLogsDir(): string {
  return path.join(os.homedir(), '.claude', 'projects');
}

export function getAllLogFiles(): string[] {
  const logsDir = getClaudeLogsDir();

  if (!fs.existsSync(logsDir)) {
    return [];
  }

  const files: string[] = [];
  const projectDirs = fs.readdirSync(logsDir);

  for (const projectDir of projectDirs) {
    const projectPath = path.join(logsDir, projectDir);
    const stat = fs.statSync(projectPath);

    if (stat.isDirectory()) {
      const jsonlFiles = fs.readdirSync(projectPath)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => path.join(projectPath, f));
      files.push(...jsonlFiles);
    }
  }

  return files;
}

export function parseLogFile(filePath: string): TokenEvent[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const events: TokenEvent[] = [];

  for (const line of lines) {
    try {
      const entry: LogEntry = JSON.parse(line);

      if (entry.type === 'assistant' && entry.message?.usage) {
        const usage = entry.message.usage;
        events.push({
          timestamp: entry.timestamp,
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          cacheReadTokens: usage.cache_read_input_tokens || 0,
          cacheCreationTokens: usage.cache_creation_input_tokens || 0,
          model: entry.message.model || 'unknown',
          sessionId: entry.sessionId,
        });
      }
    } catch {
      // Skip invalid JSON lines
    }
  }

  return events;
}

export function parseAllLogs(): TokenEvent[] {
  const files = getAllLogFiles();
  const allEvents: TokenEvent[] = [];

  for (const file of files) {
    const events = parseLogFile(file);
    allEvents.push(...events);
  }

  // Sort by timestamp
  allEvents.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return allEvents;
}

export function getRecentEvents(events: TokenEvent[], hoursAgo: number = 5): TokenEvent[] {
  const cutoff = Date.now() - (hoursAgo * 60 * 60 * 1000);
  return events.filter(e => new Date(e.timestamp).getTime() > cutoff);
}
