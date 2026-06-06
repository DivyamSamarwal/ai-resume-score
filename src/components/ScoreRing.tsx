'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getScoreColor } from '@/lib/utils';
import './Dashboard.css';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  score,
  maxScore = 100,
  size = 200,
  strokeWidth = 12,
}: ScoreRingProps) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const animationRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const offset = circumference - percentage * circumference;

  const color = getScoreColor(score, maxScore);

  // Animate the score number counting up
  const animateValue = useCallback(() => {
    const duration = 1500;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(eased * score));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  }, [score]);

  useEffect(() => {
    // Small delay before triggering animations
    const timeout = setTimeout(() => {
      setMounted(true);
      animateValue();
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateValue]);

  return (
    <div className="score-ring">
      <svg
        className="score-ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          className="score-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Animated progress arc */}
        <circle
          className="score-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
        />

        {/* Center text group (counter-rotate so text is upright) */}
        <g className="score-ring__value-group">
          <text
            className="score-ring__value"
            x={size / 2}
            y={size / 2 - 8}
            style={{ fontSize: size * 0.24 }}
          >
            {displayedScore}
          </text>
          <text
            className="score-ring__max"
            x={size / 2}
            y={size / 2 + size * 0.16}
            style={{ fontSize: size * 0.08 }}
          >
            / {maxScore}
          </text>
        </g>
      </svg>

      <span className="score-ring__label">Overall Score</span>
    </div>
  );
}
