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
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
