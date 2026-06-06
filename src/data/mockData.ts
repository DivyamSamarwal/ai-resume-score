// ============================================================
// AI Resume Evaluator — Realistic Mock Data for Demo Mode
// ============================================================

import type { EvaluationResult, GitHubMetrics, TerminalLog } from '@/types';

export const mockGitHubMetrics: GitHubMetrics = {
  username: 'alexchen-dev',
  totalPublicRepos: 23,
  recentCommits: 147,
  topLanguages: [
    { name: 'TypeScript', bytes: 245800, percentage: 42 },
    { name: 'Python', bytes: 156200, percentage: 27 },
    { name: 'Go', bytes: 87400, percentage: 15 },
    { name: 'Rust', bytes: 52300, percentage: 9 },
    { name: 'Other', bytes: 40800, percentage: 7 },
  ],
  evaluatedRepos: [
    {
      name: 'distributed-kv-store',
      description: 'A distributed key-value store with Raft consensus, built in Go. Supports sharding and replication.',
      stars: 342,
      forks: 48,
      language: 'Go',
      lastUpdated: '2026-05-28T14:32:00Z',
      commitCount: 189,
      url: 'https://github.com/alexchen-dev/distributed-kv-store',
    },
    {
      name: 'neural-search-engine',
      description: 'Semantic search engine using transformer embeddings with HNSW indexing. Handles 10M+ documents.',
      stars: 128,
      forks: 19,
      language: 'Python',
      lastUpdated: '2026-05-15T09:21:00Z',
      commitCount: 97,
      url: 'https://github.com/alexchen-dev/neural-search-engine',
    },
    {
      name: 'realtime-collab-editor',
      description: 'Real-time collaborative code editor using CRDTs and WebSocket. Deployed on Fly.io.',
      stars: 89,
      forks: 12,
      language: 'TypeScript',
      lastUpdated: '2026-04-22T16:45:00Z',
      commitCount: 234,
      url: 'https://github.com/alexchen-dev/realtime-collab-editor',
    },
    {
      name: 'rust-wasm-image-processor',
      description: 'High-performance image processing pipeline compiled to WebAssembly via Rust.',
      stars: 67,
      forks: 8,
      language: 'Rust',
      lastUpdated: '2026-03-10T11:00:00Z',
      commitCount: 56,
      url: 'https://github.com/alexchen-dev/rust-wasm-image-processor',
    },
    {
      name: 'ml-pipeline-orchestrator',
      description: 'Lightweight ML pipeline orchestrator with DAG scheduling and artifact tracking.',
      stars: 45,
      forks: 6,
      language: 'Python',
      lastUpdated: '2026-02-18T08:30:00Z',
      commitCount: 78,
      url: 'https://github.com/alexchen-dev/ml-pipeline-orchestrator',
    },
  ],
  profileUrl: 'https://github.com/alexchen-dev',
};

export const mockEvaluationResult: EvaluationResult = {
  overallScore: 78,
  pillars: {
    openSource: {
      score: 20,
      maxScore: 25,
      label: 'Open Source Contribution',
      deductions: [
        { reason: 'No merged PRs found in major external open-source projects — all repos are personal', points: -5 },
      ],
      positiveEvidence: [
        'Active commit history: 147 commits across 5 evaluated repos in the past 12 months',
        'distributed-kv-store has 342 stars and 48 forks — indicates community adoption',
        'Consistent contribution pattern across Go, Python, TypeScript, and Rust ecosystems',
      ],
    },
    selfMadeProjects: {
      score: 22,
      maxScore: 25,
      label: 'Self-Made Projects',
      deductions: [
        { reason: 'ml-pipeline-orchestrator appears to closely follow existing OSS patterns (Prefect/Dagster) without significant innovation', points: -3 },
      ],
      positiveEvidence: [
        'distributed-kv-store demonstrates complex systems engineering: Raft consensus, sharding, replication',
        'realtime-collab-editor uses CRDTs — a non-trivial distributed data structure showing deep CS knowledge',
        'rust-wasm-image-processor shows cross-language expertise and WebAssembly deployment skills',
        'neural-search-engine handles 10M+ documents — evidence of scale-oriented engineering',
      ],
    },
    productionExperience: {
      score: 22,
      maxScore: 30,
      label: 'Production Experience',
      deductions: [
        { reason: 'Resume bullet points for "Backend Engineer at DataFlow Inc." describe responsibilities rather than quantified outcomes', points: -5 },
        { reason: 'No mention of monitoring, alerting, or incident response experience', points: -3 },
      ],
      positiveEvidence: [
        '"Reduced API response latency by 62% by implementing Redis caching layer serving 2M+ daily requests"',
        '"Architected event-driven microservices processing 500K+ events/day on AWS with 99.95% uptime"',
        'Evidence of production deployment: realtime-collab-editor deployed on Fly.io',
      ],
    },
    technicalSkills: {
      score: 14,
      maxScore: 20,
      label: 'Technical Skills & Problem Solving',
      deductions: [
        { reason: 'LeetCode profile linked but shows "Knight" rating (1800) — competent but not expert level', points: -3 },
        { reason: 'No Codeforces, HackerRank, or other competitive programming platform profiles found', points: -3 },
      ],
      positiveEvidence: [
        'LeetCode profile verified: 420+ problems solved, Knight rating (1800)',
        'Demonstrated depth in distributed systems (Raft, CRDTs) beyond surface-level knowledge',
        'Polyglot engineering: TypeScript, Python, Go, Rust — with substantial projects in each',
        'Evidence of system design thinking: sharding, consensus algorithms, HNSW indexing',
      ],
    },
  },
  githubMetrics: mockGitHubMetrics,
  summary: 'Strong mid-to-senior level candidate with impressive breadth across multiple languages and genuine systems engineering depth. GitHub presence is active and shows real engineering sophistication. Production experience could be strengthened with more quantified impact metrics.',
  strengths: [
    'Exceptional project complexity — distributed systems, CRDTs, and ML pipelines demonstrate deep CS fundamentals',
    'Active and diverse GitHub profile with consistent contributions across 4+ languages',
    'Quantified production impact with specific latency and throughput improvements',
  ],
  improvements: [
    'Contribute to major external open-source projects (not just personal repos) to demonstrate collaboration skills',
    'Rewrite DataFlow Inc. bullet points with quantified outcomes: "Implemented X → reduced Y by Z%"',
    'Pursue competitive programming advancement (Expert+ on Codeforces) to strengthen problem-solving evidence',
  ],
};

export const mockTerminalLogs: TerminalLog[] = [
  {
    id: 'log-1',
    message: 'Initializing evaluation pipeline...',
    status: 'success',
    timestamp: new Date(),
  },
  {
    id: 'log-2',
    message: 'Extracting text from resume.pdf...',
    detail: 'Extracted 2,847 words from 2 pages',
    status: 'success',
    timestamp: new Date(),
  },
  {
    id: 'log-3',
    message: 'Querying GitHub REST API for @alexchen-dev...',
    detail: 'Fetched 5 repositories (sorted by updated, public only)',
    status: 'success',
    timestamp: new Date(),
  },
  {
    id: 'log-4',
    message: 'Fetching repository languages and commit history...',
    detail: 'Analyzed: distributed-kv-store, neural-search-engine, realtime-collab-editor, rust-wasm-image-processor, ml-pipeline-orchestrator',
    status: 'success',
    timestamp: new Date(),
  },
  {
    id: 'log-5',
    message: 'Evaluating against 100-point calibration rubric...',
    detail: 'Model: Gemini 2.0 Flash | Rubric: 4-pillar weighted scoring',
    status: 'success',
    timestamp: new Date(),
  },
  {
    id: 'log-6',
    message: 'Parsing structured evaluation response...',
    detail: 'Score: 78/100 — Evaluation complete',
    status: 'success',
    timestamp: new Date(),
  },
];
