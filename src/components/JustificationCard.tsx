'use client';

import { useState } from 'react';
import type { PillarScore } from '@/types';
import { getScoreColor } from '@/lib/utils';
import './Dashboard.css';

interface JustificationCardProps {
  pillar: PillarScore;
}

export default function JustificationCard({ pillar }: JustificationCardProps) {
  const [expanded, setExpanded] = useState(true);

  const color = getScoreColor(pillar.score, pillar.maxScore);
  const percentage = Math.round((pillar.score / pillar.maxScore) * 100);

  return (
    <div className="justification-card">
      <div
        className="justification-card__header"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <h3 className="justification-card__title">{pillar.label}</h3>

        <span
          className="justification-card__badge"
          style={{
            color,
            background: `${color}18`,
          }}
        >
          {pillar.score}/{pillar.maxScore} ({percentage}%)
        </span>

        <svg
          className={`justification-card__chevron ${
            expanded ? 'justification-card__chevron--open' : ''
          }`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className={`justification-card__body ${
          expanded
            ? 'justification-card__body--expanded'
            : 'justification-card__body--collapsed'
        }`}
      >
        {/* Positive Evidence */}
        {pillar.positiveEvidence.length > 0 && (
          <div className="justification-card__section">
            <div
              className="justification-card__section-label"
              style={{ color: 'var(--success)' }}
            >
              Evidence
            </div>
            <ul className="justification-card__list">
              {pillar.positiveEvidence.map((item, i) => (
                <li key={i} className="justification-card__item">
                  <span className="justification-card__icon justification-card__icon--positive">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deductions */}
        {pillar.deductions.length > 0 && (
          <div className="justification-card__section">
            <div
              className="justification-card__section-label"
              style={{ color: 'var(--danger)' }}
            >
              Deductions
            </div>
            <ul className="justification-card__list">
              {pillar.deductions.map((deduction, i) => (
                <li key={i} className="justification-card__item">
                  <span className="justification-card__icon justification-card__icon--negative">
                    ✕
                  </span>
                  <span>
                    <span className="justification-card__points">
                      -{deduction.points} pts:
                    </span>{' '}
                    {deduction.reason}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
