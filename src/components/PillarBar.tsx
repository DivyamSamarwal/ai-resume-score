'use client';

import { useEffect, useState } from 'react';
import { getScoreColor } from '@/lib/utils';
import './Dashboard.css';

interface PillarBarProps {
  label: string;
  score: number;
  maxScore: number;
  delay?: number;
}

export default function PillarBar({
  label,
  score,
  maxScore,
  delay = 0,
}: PillarBarProps) {
  const [animated, setAnimated] = useState(false);

  const percentage = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score, maxScore);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimated(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="pillar-bar" style={{ animationDelay: `${delay}s` }}>
      <div className="pillar-bar__header">
        <span className="pillar-bar__label">{label}</span>
        <span className="pillar-bar__score">
          {score}/{maxScore}
        </span>
      </div>
      <div className="pillar-bar__track">
        <div
          className="pillar-bar__fill"
          style={{
            width: animated ? `${percentage}%` : '0%',
            backgroundColor: color,
            transitionDelay: `${delay}s`,
          }}
        />
      </div>
    </div>
  );
}
