// ============================================================
// AI Resume Evaluator — Shared Type Definitions
// ============================================================

/** Individual deduction detail for a scoring pillar */
export interface Deduction {
  reason: string;
  points: number;
}

/** Score breakdown for a single evaluation pillar */
export interface PillarScore {
  score: number;
  maxScore: number;
  label: string;
  deductions: Deduction[];
  positiveEvidence: string[];
}

/** Summary of a single GitHub repository */
export interface RepoSummary {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  commitCount: number;
  url: string;
}

/** Aggregated GitHub metrics for the candidate */
export interface GitHubMetrics {
  username: string;
  totalPublicRepos: number;
  recentCommits: number;
  topLanguages: { name: string; bytes: number; percentage: number }[];
  evaluatedRepos: RepoSummary[];
  profileUrl: string;
}

/** Complete evaluation result from the LLM */
export interface EvaluationResult {
  overallScore: number;
  pillars: {
    openSource: PillarScore;
    selfMadeProjects: PillarScore;
    productionExperience: PillarScore;
    technicalSkills: PillarScore;
  };
  githubMetrics: GitHubMetrics | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  model?: string; // e.g. 'gemini', 'openai' — stored at evaluation time
}

/** Terminal log entry status */
export type LogStatus = 'pending' | 'running' | 'success' | 'error';

/** Single entry in the terminal logger */
export interface TerminalLog {
  id: string;
  message: string;
  detail?: string;
  status: LogStatus;
  timestamp: Date;
}

/** User API configuration */
export interface ApiConfig {
  geminiKey: string;
  deepseekKey: string;
  groqKey: string;
  openrouterKey: string;
  openaiKey: string;
  anthropicKey: string;
  githubToken: string;
  githubUsername: string;
  jobDescription?: string;
  selectedModel: 'gemini' | 'deepseek' | 'groq' | 'openrouter' | 'openai' | 'anthropic';
}

/** Application step state machine */
export type AppStep = 'configure' | 'upload' | 'evaluating' | 'results';

/** Toast notification types */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast notification */
export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/** PDF parse response from the API */
export interface ParsePdfResponse {
  text: string;
  pageCount: number;
  wordCount: number;
  githubUsername?: string;
}

/** GitHub API response from our proxy */
export interface GitHubProxyResponse {
  metrics: GitHubMetrics;
  rateLimit: {
    remaining: number;
    limit: number;
    reset: number;
  };
}
