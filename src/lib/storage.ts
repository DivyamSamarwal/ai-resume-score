import { EvaluationResult } from '@/types';

const HISTORY_KEY = 'base100_history';
const MAX_HISTORY = 10;

export interface HistoryItem {
  id: string;
  timestamp: number;
  label: string; // e.g., "@octocat" or "Evaluation - [Date]"
  result: EvaluationResult;
}

export function saveToHistory(label: string, result: EvaluationResult): void {
  if (typeof window === 'undefined') return;

  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    let history: HistoryItem[] = historyStr ? JSON.parse(historyStr) : [];

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label,
      result,
    };

    history = [newItem, ...history];

    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save evaluation to history:', error);
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const historyStr = localStorage.getItem(HISTORY_KEY);
    if (!historyStr) return [];

    const parsed = JSON.parse(historyStr);

    // Validate that parsed data is an array of valid HistoryItems
    if (!Array.isArray(parsed)) {
      console.warn('History data is not an array, clearing corrupted data.');
      localStorage.removeItem(HISTORY_KEY);
      return [];
    }

    // Filter out any malformed entries
    return parsed.filter(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'timestamp' in item &&
        'label' in item &&
        'result' in item &&
        typeof (item as HistoryItem).result === 'object' &&
        (item as HistoryItem).result !== null &&
        'overallScore' in (item as HistoryItem).result
    );
  } catch (error) {
    console.error('Failed to load history, clearing corrupted data:', error);
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
