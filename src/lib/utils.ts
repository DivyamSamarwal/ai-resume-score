// ============================================================
// AI Resume Evaluator — Utility Functions
// ============================================================

/**
 * Format bytes into human-readable file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get a semantic HSL color string based on score percentage.
 * Red → Amber → Green gradient.
 */
export function getScoreColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--warning)';
  if (pct >= 40) return '#f97316'; // orange
  return 'var(--danger)';
}

/**
 * Get CSS class suffix for score level.
 */
export function getScoreLevel(score: number, max: number): 'high' | 'medium' | 'low' {
  const pct = (score / max) * 100;
  if (pct >= 70) return 'high';
  if (pct >= 45) return 'medium';
  return 'low';
}

/**
 * Join CSS class names, filtering falsy values.
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Basic API key format validation (non-empty, reasonable length).
 */
export function validateApiKey(key: string, provider: 'gemini' | 'deepseek' | 'github' | 'groq' | 'openrouter' | 'openai' | 'anthropic'): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  switch (provider) {
    case 'gemini':
      return trimmed.length >= 30;
    case 'deepseek':
      return trimmed.startsWith('sk-') && trimmed.length >= 20;
    case 'groq':
      return trimmed.startsWith('gsk_') && trimmed.length >= 20;
    case 'openrouter':
      return trimmed.startsWith('sk-or-v1-') && trimmed.length >= 20;
    case 'openai':
      return trimmed.startsWith('sk-') && trimmed.length >= 20;
    case 'anthropic':
      return trimmed.startsWith('sk-ant-') && trimmed.length >= 20;
    case 'github':
      return (trimmed.startsWith('ghp_') || trimmed.startsWith('github_pat_')) && trimmed.length >= 20;
    default:
      return trimmed.length > 10;
  }
}

/**
 * Generate a unique ID for log entries and toasts.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format a date string relative to now (e.g. "3 days ago").
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

/** Max file size in bytes (4MB — under Vercel's 4.5MB limit) */
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

/** Vercel free tier serverless function timeout (ms) */
export const SERVERLESS_TIMEOUT = 55_000;
