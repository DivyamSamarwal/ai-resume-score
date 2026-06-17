'use client';

import React, { useMemo } from 'react';
import type { EvaluationResult } from '@/types';
import { detectWeakPhrases } from '@/lib/analyzer';
import { Target, AlertTriangle } from 'lucide-react';

interface ResumeAnalyzerCardProps {
  result: EvaluationResult;
}

export default function ResumeAnalyzerCard({ result }: ResumeAnalyzerCardProps) {
  const weakPhrases = useMemo(() => {
    return detectWeakPhrases(result.resumeText || '');
  }, [result.resumeText]);

  const unquantifiedBullets = useMemo(() => {
    if (!result.unquantifiedBullets) return [];
    // LLMs can struggle with negative constraints ("find bullets WITHOUT numbers").
    // We apply a strict client-side regex filter to throw out any AI mistakes that actually contain digits.
    return result.unquantifiedBullets.filter(bullet => !/\d/.test(bullet));
  }, [result.unquantifiedBullets]);

  const hasUnquantified = unquantifiedBullets.length > 0;
  const hasWeakPhrases = weakPhrases.length > 0;

  if (!hasUnquantified && !hasWeakPhrases) return null;

  return (
    <div className="card" style={{ marginTop: '24px', border: '2px solid var(--danger)' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Target size={20} color="var(--danger)" />
        Impact & Metrics Analysis
      </h3>

      {hasUnquantified && (
        <div style={{ marginBottom: hasWeakPhrases ? '24px' : '0' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Unquantified Bullet Points
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            The following bullet points lack numbers, percentages, or measurable impact. Consider rewriting them using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {unquantifiedBullets.map((bullet, idx) => (
              <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                &ldquo;{bullet}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWeakPhrases && (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="var(--warning)" />
            Weak Action Verbs Detected
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            Replace these passive or cliché phrases with strong action verbs (e.g., Architected, Spearheaded, Engineered).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weakPhrases.map((match, idx) => (
              <div key={idx} style={{ fontSize: '0.85rem', padding: '10px 12px', backgroundColor: 'var(--bg-elevated)', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ fontWeight: 800, color: 'var(--danger)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Found: &quot;{match.phrase}&quot;
                </div>
                <div style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  &ldquo;{match.context}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
