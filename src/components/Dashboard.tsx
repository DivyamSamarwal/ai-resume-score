'use client';

import React, { useState } from 'react';
import type { EvaluationResult, PillarScore } from '@/types';
import ScoreRing from './ScoreRing';
import PillarBar from './PillarBar';
import ResumeAnalyzerCard from './ResumeAnalyzerCard';
import JustificationCard from './JustificationCard';
import GitHubCard from './GitHubCard';
import PdfExportButton from './PdfExportButton';
import { Copy, Check } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  result: EvaluationResult;
  dbId?: string | null;
}

const PILLAR_DELAYS = [0, 0.2, 0.4, 0.6];

export default function Dashboard({ result, dbId }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const pillars: PillarScore[] = [
    result.pillars.openSource,
    result.pillars.selfMadeProjects,
    result.pillars.productionExperience,
    result.pillars.technicalSkills,
  ];

  const MODEL_INFO: Record<string, { label: string; color: string }> = {
    gemini:     { label: 'Gemini 2.0 Flash', color: '#4285F4' },
    openai:     { label: 'GPT-4o',           color: '#10a37f' },
    anthropic:  { label: 'Claude 3.5 Sonnet',color: '#c27830' },
    deepseek:   { label: 'DeepSeek Chat',    color: '#7c3aed' },
    groq:       { label: 'Groq LLaMA-3',     color: '#f59e0b' },
    openrouter: { label: 'OpenRouter',        color: '#6b7280' },
  };
  const modelInfo = result.model ? MODEL_INFO[result.model] : null;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <h1 className="dashboard__title" style={{ marginBottom: 0 }}>Evaluation Results</h1>
          {modelInfo && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              border: `2px solid ${modelInfo.color}`,
              borderRadius: '2px',
              color: modelInfo.color,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              ✦ {modelInfo.label}
            </span>
          )}
        </div>
        <p className="dashboard__subtitle">{result.summary}</p>
        
        <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid #fff', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'inline-block' }}>
          <strong>Note:</strong> Since evaluations are generated dynamically by AI, your score and deductions may vary slightly depending on which model you choose to use (e.g., OpenAI vs Anthropic vs Gemini).
        </div>
      </header>

      {/* Two-column grid */}
      <div className="dashboard__grid">
        {/* ── Left Column ──────────────────────────────────────── */}
        <div className="dashboard__column">
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            <PdfExportButton result={result} />
            {dbId && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/report/${dbId}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Share Link'}
              </button>
            )}
          </div>

          {/* Score Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <ScoreRing score={result.overallScore} />
          </div>

          {/* Pillar Bars */}
          <div className="pillar-bars">
            <div className="pillar-bars__title">Score Breakdown</div>
            {pillars.map((pillar, i) => (
              <PillarBar
                key={pillar.label}
                label={pillar.label}
                score={pillar.score}
                maxScore={pillar.maxScore}
                delay={PILLAR_DELAYS[i]}
              />
            ))}
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="insight-card" style={{ animationDelay: '0.3s' }}>
              <h3
                className="insight-card__title"
                style={{ color: 'var(--success)' }}
              >
                ✦ Strengths
              </h3>
              <ul className="insight-card__list">
                {result.strengths.map((item, i) => (
                  <li key={i} className="insight-card__item">
                    <span
                      className="insight-card__dot"
                      style={{ backgroundColor: 'var(--success)' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {result.improvements.length > 0 && (
            <div className="insight-card" style={{ animationDelay: '0.4s' }}>
              <h3
                className="insight-card__title"
                style={{ color: 'var(--warning)' }}
              >
                ▲ Areas for Improvement
              </h3>
              <ul className="insight-card__list">
                {result.improvements.map((item, i) => (
                  <li key={i} className="insight-card__item">
                    <span
                      className="insight-card__dot"
                      style={{ backgroundColor: 'var(--warning)' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResumeAnalyzerCard result={result} />
        </div>

        {/* ── Right Column ─────────────────────────────────────── */}
        <div className="dashboard__column">
          {/* Justification Cards */}
          {pillars.map((pillar, i) => (
            <JustificationCard
              key={pillar.label}
              pillar={pillar}
            />
          ))}

          {/* GitHub Card */}
          {result.githubMetrics && (
            <GitHubCard metrics={result.githubMetrics} />
          )}
        </div>
      </div>
    </div>
  );
}
