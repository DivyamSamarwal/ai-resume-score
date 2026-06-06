// ============================================================
// API Route: POST /api/github
// Fetches GitHub profile data and aggregates into GitHubMetrics.
// Token is optional — degrades gracefully without it (lower rate limit).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { GitHubMetrics, GitHubProxyResponse, RepoSummary } from '@/types';

const GITHUB_API = 'https://api.github.com';
const GITHUB_HEADERS_BASE: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'ai-resume-evaluator/1.0',
};

/** Build headers with optional auth token */
function buildHeaders(token?: string): Record<string, string> {
  const headers = { ...GITHUB_HEADERS_BASE };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Safe JSON fetch with error propagation */
async function githubFetch<T>(
  url: string,
  headers: Record<string, string>,
): Promise<{ data: T; response: Response }> {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new GitHubApiError(response.status, body, response);
  }

  const data = (await response.json()) as T;
  return { data, response };
}

class GitHubApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public response: Response,
  ) {
    super(`GitHub API responded with ${status}`);
    this.name = 'GitHubApiError';
  }
}

// ── GitHub API response types (subset) ──────────────────────
interface GHRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  fork: boolean;
  owner: { login: string };
}

interface GHUser {
  login: string;
  public_repos: number;
  html_url: string;
}

interface GHCommit {
  sha: string;
}

export async function POST(request: NextRequest) {
  try {
    // ── Parse request body ────────────────────────────────
    let body: { username?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const username = body.username?.trim();
    if (!username) {
      return NextResponse.json(
        { error: 'Missing required field: "username".' },
        { status: 400 },
      );
    }

    // ── Read optional GitHub token ────────────────────────
    const token = request.headers.get('x-github-token') || undefined;
    const headers = buildHeaders(token);

    // ── Fetch user profile ────────────────────────────────
    let userData: GHUser;
    let lastResponse: Response;

    try {
      const result = await githubFetch<GHUser>(
        `${GITHUB_API}/users/${encodeURIComponent(username)}`,
        headers,
      );
      userData = result.data;
      lastResponse = result.response;
    } catch (err) {
      if (err instanceof GitHubApiError) {
        if (err.status === 404) {
          return NextResponse.json(
            { error: `GitHub user "${username}" not found.` },
            { status: 404 },
          );
        }
        if (err.status === 403) {
          const resetTs = err.response.headers.get('x-ratelimit-reset');
          const resetStr = resetTs
            ? ` Resets at ${new Date(Number(resetTs) * 1000).toISOString()}.`
            : '';
          return NextResponse.json(
            {
              error: `GitHub API rate limit exceeded.${resetStr} Provide a GitHub token to increase your limit.`,
            },
            { status: 429 },
          );
        }
      }
      throw err;
    }

    // ── Fetch repos (top 5 by recent update) ─────────────
    const { data: repos, response: reposResponse } = await githubFetch<
      GHRepo[]
    >(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5&type=public`,
      headers,
    );
    lastResponse = reposResponse;

    // Filter out forks to focus on original work
    const ownRepos = repos.filter((r) => !r.fork).slice(0, 5);

    // ── For each repo: fetch languages + recent commit count
    const languageTotals = new Map<string, number>();
    const evaluatedRepos: RepoSummary[] = [];
    let totalRecentCommits = 0;

    await Promise.all(
      ownRepos.map(async (repo) => {
        // Fetch languages
        const { data: languages } = await githubFetch<Record<string, number>>(
          `${GITHUB_API}/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/languages`,
          headers,
        );

        for (const [lang, bytes] of Object.entries(languages)) {
          languageTotals.set(lang, (languageTotals.get(lang) || 0) + bytes);
        }

        // Fetch recent commits (just first page, 1 per page, to check activity)
        let commitCount = 0;
        try {
          const { data: commits, response: commitResponse } =
            await githubFetch<GHCommit[]>(
              `${GITHUB_API}/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/commits?per_page=1`,
              headers,
            );
          lastResponse = commitResponse;

          // Use Link header to estimate total commit count
          const linkHeader = commitResponse.headers.get('link');
          if (linkHeader) {
            const lastMatch = linkHeader.match(
              /[&?]page=(\d+)>;\s*rel="last"/,
            );
            if (lastMatch) {
              commitCount = parseInt(lastMatch[1], 10);
            } else {
              commitCount = commits.length;
            }
          } else {
            commitCount = commits.length;
          }
        } catch {
          // Non-critical — repo might be empty
          commitCount = 0;
        }

        totalRecentCommits += commitCount;

        evaluatedRepos.push({
          name: repo.name,
          description: repo.description || '',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language || 'Unknown',
          lastUpdated: repo.updated_at,
          commitCount,
          url: repo.html_url,
        });
      }),
    );

    // ── Aggregate top languages by byte count ─────────────
    const totalBytes = Array.from(languageTotals.values()).reduce(
      (sum, b) => sum + b,
      0,
    );
    const topLanguages = Array.from(languageTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      }));

    // ── Build GitHubMetrics ───────────────────────────────
    const metrics: GitHubMetrics = {
      username: userData.login,
      totalPublicRepos: userData.public_repos,
      recentCommits: totalRecentCommits,
      topLanguages,
      evaluatedRepos,
      profileUrl: userData.html_url,
    };

    // ── Extract rate limit info from last response ────────
    const rateLimit = {
      remaining: Number(lastResponse!.headers.get('x-ratelimit-remaining') ?? 0),
      limit: Number(lastResponse!.headers.get('x-ratelimit-limit') ?? 0),
      reset: Number(lastResponse!.headers.get('x-ratelimit-reset') ?? 0),
    };

    const response: GitHubProxyResponse = { metrics, rateLimit };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[github] Unexpected error:', err);

    if (err instanceof GitHubApiError) {
      if (err.status === 403) {
        return NextResponse.json(
          {
            error:
              'GitHub API rate limit exceeded. Provide a personal access token via the x-github-token header.',
          },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `GitHub API error (${err.status}).` },
        { status: err.status >= 500 ? 502 : err.status },
      );
    }

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    return NextResponse.json(
      { error: `Failed to fetch GitHub data: ${message}` },
      { status: 500 },
    );
  }
}
