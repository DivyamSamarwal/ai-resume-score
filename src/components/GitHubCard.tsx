'use client';

import type { GitHubMetrics } from '@/types';
import { timeAgo } from '@/lib/utils';
import './Dashboard.css';

interface GitHubCardProps {
  metrics: GitHubMetrics;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  JavaScript: '#f1e05a',
  Java: '#b07219',
  Other: '#8b8b8b',
};

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other;
}

export default function GitHubCard({ metrics }: GitHubCardProps) {
  return (
    <div className="github-card">
      {/* Header */}
      <div className="github-card__header">
        <svg
          className="github-card__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        <a
          className="github-card__username"
          href={metrics.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{metrics.username}
        </a>
      </div>

      {/* Stats Row */}
      <div className="github-card__stats">
        <div className="github-card__stat">
          <span className="github-card__stat-value">
            {metrics.totalPublicRepos}
          </span>
          <span className="github-card__stat-label">Public Repos</span>
        </div>
        <div className="github-card__stat">
          <span className="github-card__stat-value">
            {metrics.recentCommits}
          </span>
          <span className="github-card__stat-label">Recent Commits</span>
        </div>
      </div>

      {/* Language Distribution */}
      {metrics.topLanguages.length > 0 && (
        <div className="github-card__languages">
          <div className="github-card__lang-title">Language Distribution</div>
          <div className="github-card__lang-bar">
            {metrics.topLanguages.map((lang) => (
              <div
                key={lang.name}
                className="github-card__lang-segment"
                style={{
                  flex: lang.percentage,
                  backgroundColor: getLanguageColor(lang.name),
                }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>
          <div className="github-card__lang-legend">
            {metrics.topLanguages.map((lang) => (
              <div key={lang.name} className="github-card__lang-item">
                <span
                  className="github-card__lang-dot"
                  style={{ backgroundColor: getLanguageColor(lang.name) }}
                />
                <span>{lang.name}</span>
                <span className="github-card__lang-pct">
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluated Repos */}
      {metrics.evaluatedRepos.length > 0 && (
        <div>
          <div className="github-card__repos-title">Evaluated Repositories</div>
          <div className="github-card__repos">
            {metrics.evaluatedRepos.map((repo) => (
              <div key={repo.name} className="github-card__repo">
                <div className="github-card__repo-left">
                  <a
                    className="github-card__repo-name"
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                  <div className="github-card__repo-meta">
                    <span>{repo.commitCount} commits</span>
                    <span>·</span>
                    <span>{timeAgo(repo.lastUpdated)}</span>
                  </div>
                </div>
                <div className="github-card__repo-right">
                  <span className="github-card__repo-stars">
                    ★ {repo.stars}
                  </span>
                  <span
                    className="github-card__lang-badge"
                    style={{
                      borderLeft: `3px solid ${getLanguageColor(repo.language)}`,
                    }}
                  >
                    {repo.language}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
