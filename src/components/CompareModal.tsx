'use client';

import React from 'react';
import type { HistoryItem } from '@/lib/storage';
import type { PillarScore } from '@/types';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompareModalProps {
  itemA: HistoryItem;
  itemB: HistoryItem;
  onClose: () => void;
}

const MODEL_LABELS: Record<string, string> = {
  gemini:     'Gemini 2.0 Flash',
  openai:     'GPT-4o',
  anthropic:  'Claude 3.5 Sonnet',
  deepseek:   'DeepSeek Chat',
  groq:       'Groq LLaMA-3',
  openrouter: 'OpenRouter',
};

const PILLAR_KEYS = [
  { key: 'openSource',          label: 'Open Source' },
  { key: 'selfMadeProjects',    label: 'Self-Made Projects' },
  { key: 'productionExperience',label: 'Production Experience' },
  { key: 'technicalSkills',     label: 'Technical Skills' },
] as const;

function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--warning)';
  if (pct >= 40) return '#f97316';
  return 'var(--danger)';
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp size={14} color="var(--success)" />;
  if (delta < 0) return <TrendingDown size={14} color="var(--danger)" />;
  return <Minus size={14} color="var(--text-tertiary)" />;
}

function ScoreBar({ score, max, color }: { score: number; max: number; color: string }) {
  const clampedScore = Math.min(score, max);
  const pct = Math.min(100, (clampedScore / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
      <div style={{
        flex: 1,
        height: '8px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid #000',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.6s ease-out',
        }} />
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color, minWidth: '36px', textAlign: 'right' }}>
        {clampedScore}/{max}
      </span>
    </div>
  );
}

export default function CompareModal({ itemA, itemB, onClose }: CompareModalProps) {
  // Clamp total to sum of clamped pillars to fix any AI math errors in old data
  const clampPillars = (result: HistoryItem['result']) => {
    const p = result.pillars;
    return (
      Math.min(p.openSource.score, p.openSource.maxScore) +
      Math.min(p.selfMadeProjects.score, p.selfMadeProjects.maxScore) +
      Math.min(p.productionExperience.score, p.productionExperience.maxScore) +
      Math.min(p.technicalSkills.score, p.technicalSkills.maxScore)
    );
  };

  const scoreA = clampPillars(itemA.result);
  const scoreB = clampPillars(itemB.result);
  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';

  const modelA = itemA.result.model ? (MODEL_LABELS[itemA.result.model] ?? itemA.result.model) : 'Unknown Model';
  const modelB = itemB.result.model ? (MODEL_LABELS[itemB.result.model] ?? itemB.result.model) : 'Unknown Model';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '3px solid #000',
        boxShadow: '6px 6px 0px #000',
        width: '100%',
        maxWidth: '860px',
        padding: '32px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: '2px solid #000',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          ⇄ Candidate Comparison
        </h2>

        {/* Overall Score Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '20px',
          border: '2px solid #000',
          boxShadow: '3px 3px 0 #000',
          backgroundColor: 'var(--bg-elevated)',
        }}>
          {/* Candidate A */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
              marginBottom: '4px',
            }}>
              CANDIDATE A {winner === 'A' && '🏆'}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px', wordBreak: 'break-word' }}>
              {itemA.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {new Date(itemA.timestamp).toLocaleDateString()} · {modelA}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: scoreColor(scoreA, 100),
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {scoreA}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>/100</div>
          </div>

          {/* VS Divider */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            padding: '0 8px',
            marginTop: '40px',
          }}>
            VS
          </div>

          {/* Candidate B */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
              marginBottom: '4px',
            }}>
              CANDIDATE B {winner === 'B' && '🏆'}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px', wordBreak: 'break-word' }}>
              {itemB.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {new Date(itemB.timestamp).toLocaleDateString()} · {modelB}
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: scoreColor(scoreB, 100),
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {scoreB}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>/100</div>
          </div>
        </div>

        {/* Pillar-by-Pillar Breakdown */}
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Pillar Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PILLAR_KEYS.map(({ key, label }) => {
            const pA = itemA.result.pillars[key] as PillarScore;
            const pB = itemB.result.pillars[key] as PillarScore;
            const clampedA = Math.min(pA.score, pA.maxScore);
            const clampedB = Math.min(pB.score, pB.maxScore);
            const delta = clampedA - clampedB;

            return (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px 1fr',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  border: '2px solid #000',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              >
                {/* A bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ScoreBar score={clampedA} max={pA.maxScore} color={scoreColor(clampedA, pA.maxScore)} />
                </div>

                {/* Label + delta */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.2 }}>
                    {label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <DeltaIcon delta={delta} />
                    <span style={{ color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                      {delta === 0 ? 'Tie' : `${delta > 0 ? '+' : ''}${delta}`}
                    </span>
                  </div>
                </div>

                {/* B bar (mirrored) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'row-reverse' }}>
                  <ScoreBar score={clampedB} max={pB.maxScore} color={scoreColor(clampedB, pB.maxScore)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        <div style={{
          marginTop: '24px',
          padding: '16px 20px',
          border: '2px solid #000',
          boxShadow: '3px 3px 0 #000',
          backgroundColor: winner === 'tie' ? 'var(--bg-elevated)' : 'var(--primary-color)',
          color: winner === 'tie' ? 'var(--text-primary)' : '#000',
        }}>
          <span style={{ fontWeight: 900, fontSize: '1rem' }}>
            {winner === 'tie'
              ? '🤝 Both candidates scored equally.'
              : `🏆 ${winner === 'A' ? itemA.label : itemB.label} wins by ${Math.abs(scoreA - scoreB)} point${Math.abs(scoreA - scoreB) !== 1 ? 's' : ''}.`}
          </span>
        </div>
      </div>
    </div>
  );
}
