'use client';

import React from 'react';
import type { HistoryItem } from '@/lib/storage';
import { Clock, ChevronRight, Trash2, GitCompareArrows } from 'lucide-react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onCompare: (item: HistoryItem) => void;
  onClear: () => void;
  pendingCompareId: string | null;
}

const MODEL_LABELS: Record<string, { label: string; color: string }> = {
  gemini:     { label: 'Gemini',    color: '#4285F4' },
  openai:     { label: 'GPT-4o',    color: '#10a37f' },
  anthropic:  { label: 'Claude',    color: '#c27830' },
  deepseek:   { label: 'DeepSeek',  color: '#7c3aed' },
  groq:       { label: 'Groq',      color: '#f59e0b' },
  openrouter: { label: 'OpenRouter',color: '#6b7280' },
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'var(--success)' :
    score >= 60 ? 'var(--warning)' :
    score >= 40 ? '#f97316' :
    'var(--danger)';

  const label =
    score >= 80 ? '🏆 Excellent' :
    score >= 60 ? '✅ Good' :
    score >= 40 ? '⚠️ Fair' :
    '❌ Needs Work';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '6px',
    }}>
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        border: `2px solid ${color}`,
        borderRadius: '2px',
        fontSize: '0.78rem',
        fontWeight: 700,
        color,
        letterSpacing: '0.03em',
        lineHeight: 1.4,
      }}>
        {score}/100
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

export default function HistorySidebar({ history, onSelect, onCompare, onClear, pendingCompareId }: HistorySidebarProps) {
  if (history.length === 0) return null;

  const canCompare = history.length >= 2;

  return (
    <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Recent Evaluations
        </h3>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear your evaluation history?')) {
              onClear();
            }
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {canCompare && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitCompareArrows size={13} />
          {pendingCompareId
            ? 'Now click a second evaluation to compare side-by-side.'
            : 'Click ⇄ to compare two evaluations side-by-side.'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item) => {
          const modelInfo = item.result.model ? MODEL_LABELS[item.result.model] : null;
          const isPending = item.id === pendingCompareId;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                border: isPending ? '2px solid var(--primary-color)' : '2px solid #000',
                boxShadow: isPending ? '2px 2px 0px var(--primary-color)' : '2px 2px 0px #000',
                transition: 'box-shadow 0.1s, border-color 0.1s',
                overflow: 'hidden',
              }}
            >
              {/* Main click area */}
              <button
                onClick={() => onSelect(item)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 16px',
                  backgroundColor: isPending ? 'color-mix(in srgb, var(--primary-color) 15%, var(--bg-card))' : 'var(--bg-card)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.label}</div>
                  {modelInfo && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      border: `1.5px solid ${modelInfo.color}`,
                      borderRadius: '2px',
                      color: modelInfo.color,
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}>
                      {modelInfo.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
                <ScoreBadge score={item.result.overallScore} />
              </button>

              {/* Divider */}
              <div style={{ width: '1px', backgroundColor: '#000' }} />

              {/* Compare button */}
              {canCompare && (
                <button
                  onClick={() => onCompare(item)}
                  title={isPending ? 'Selected for comparison' : 'Compare with another'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    flexShrink: 0,
                    backgroundColor: isPending ? 'var(--primary-color)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isPending ? '#000' : 'var(--text-tertiary)',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                  onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <GitCompareArrows size={15} />
                </button>
              )}

              {/* View button */}
              <div style={{ width: '1px', backgroundColor: '#000' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', flexShrink: 0, backgroundColor: 'var(--bg-card)', pointerEvents: 'none' }}>
                <ChevronRight size={16} color="var(--text-tertiary)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
