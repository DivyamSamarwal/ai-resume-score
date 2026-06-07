// ============================================================
// API Route: POST /api/evaluate
// Sends resume + optional GitHub data to Gemini or DeepSeek,
// parses the LLM's JSON response into an EvaluationResult.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { buildEvaluationPrompt } from '@/lib/prompts';
import { z } from 'zod';

// Generous timeout but under Vercel's 60 s limit
const LLM_TIMEOUT_MS = 55_000;

// Maximum allowed size for resume text (roughly ~15 pages of text)
const MAX_RESUME_LENGTH = 50_000;

// ── Request body shape ──────────────────────────────────────
interface EvaluateBody {
  resumeText: string;
  githubData: string | null;
  jobDescription?: string;
  model: 'gemini' | 'deepseek' | 'groq' | 'openrouter';
}

// ── Gemini response shape ───────────────────────────────────
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

// ── DeepSeek response shape ─────────────────────────────────
interface DeepSeekResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message: string; type: string };
}

/** Extract raw JSON from a string that may be wrapped in markdown fences */
function extractJsonFromText(raw: string): string {
  const trimmed = raw.trim();

  // Try to extract from ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Might already be raw JSON
  return trimmed;
}

/** Zod Validation Schema for EvaluationResult */
const DeductionSchema = z.object({
  reason: z.string(),
  points: z.number(),
});

const PillarScoreSchema = z.object({
  score: z.number(),
  maxScore: z.number(),
  label: z.string(),
  deductions: z.array(DeductionSchema),
  positiveEvidence: z.array(z.string()),
});

const EvaluationResultSchema = z.object({
  overallScore: z.number(),
  pillars: z.object({
    openSource: PillarScoreSchema,
    selfMadeProjects: PillarScoreSchema,
    productionExperience: PillarScoreSchema,
    technicalSkills: PillarScoreSchema,
  }),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

/** Call the Gemini API with automatic retries for rate limits */
async function callGemini(
  apiKey: string,
  prompt: string,
  maxRetries = 2
): Promise<string> {
  // Use current working model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');

        if (response.status === 400 || response.status === 403) {
          throw new LLMError(
            'Invalid or unauthorized Gemini API key. Please check your key.',
            response.status,
          );
        }
        if (response.status === 429) {
          if (attempt < maxRetries) {
            // Exponential backoff: 2s, 4s, etc.
            const delay = Math.pow(2, attempt) * 2000;
            console.log(`[evaluate] Gemini 429 Rate Limit. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue; // retry
          } else {
            throw new LLMError(
              'Gemini rate limit exceeded (quota hit). Please check your Google AI Studio billing/quotas or try again later.',
              429,
            );
          }
        }
        throw new LLMError(
          `Gemini API error (${response.status}): ${errorBody.slice(0, 200)}`,
          response.status,
        );
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new LLMError(
          `Gemini API error: ${data.error.message}`,
          data.error.code || 500,
        );
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new LLMError('Gemini returned an empty response.', 502);
      }

      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error('Unreachable code in callGemini');
}

/** Call the DeepSeek API */
async function callDeepSeek(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');

      if (response.status === 401 || response.status === 403) {
        throw new LLMError(
          'Invalid or unauthorized DeepSeek API key. Please check your key.',
          response.status,
        );
      }
      if (response.status === 429) {
        throw new LLMError(
          'DeepSeek rate limit exceeded. Please wait a moment and try again.',
          429,
        );
      }
      throw new LLMError(
        `DeepSeek API error (${response.status}): ${errorBody.slice(0, 200)}`,
        response.status,
      );
    }

    const data: DeepSeekResponse = await response.json();

    if (data.error) {
      throw new LLMError(
        `DeepSeek API error: ${data.error.message}`,
        500,
      );
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new LLMError('DeepSeek returned an empty response.', 502);
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

/** Call the Groq API (LLaMA-3 70B) */
async function callGroq(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) throw new LLMError('Invalid or unauthorized Groq API key.', response.status);
      if (response.status === 429) throw new LLMError('Groq rate limit exceeded.', 429);
      throw new LLMError(`Groq API error (${response.status}): ${errorBody.slice(0, 200)}`, response.status);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new LLMError('Groq returned an empty response.', 502);

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

/** Call the OpenRouter API */
async function callOpenRouter(
  apiKey: string,
  prompt: string,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://resume-evaluator.vercel.app',
          'X-Title': 'Resume Evaluator',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', // Fast, reliable default for OpenRouter
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) throw new LLMError('Invalid or unauthorized OpenRouter API key.', response.status);
      if (response.status === 429) throw new LLMError('OpenRouter rate limit exceeded.', 429);
      throw new LLMError(`OpenRouter API error (${response.status}): ${errorBody.slice(0, 200)}`, response.status);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new LLMError('OpenRouter returned an empty response.', 502);

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

class LLMError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Read API key from header ──────────────────────────
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing API key. Provide it in the "x-api-key" header.' },
        { status: 401 },
      );
    }

    // ── Parse request body ────────────────────────────────
    let body: EvaluateBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const { resumeText, githubData, model, jobDescription } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty "resumeText" field.' },
        { status: 400 },
      );
    }

    if (resumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        { error: `Resume text is too long (${resumeText.length} chars). Maximum allowed is ${MAX_RESUME_LENGTH} characters.` },
        { status: 413 },
      );
    }

    if (!['gemini', 'deepseek', 'groq', 'openrouter'].includes(model)) {
      return NextResponse.json(
        { error: 'Invalid "model" field. Must be "gemini", "deepseek", "groq", or "openrouter".' },
        { status: 400 },
      );
    }

    // ── Build the evaluation prompt ───────────────────────
    const prompt = buildEvaluationPrompt(resumeText, githubData, jobDescription);

    // ── Call the selected LLM ─────────────────────────────
    let rawText: string;
    try {
      rawText =
        model === 'gemini' ? await callGemini(apiKey.trim(), prompt) :
        model === 'deepseek' ? await callDeepSeek(apiKey.trim(), prompt) :
        model === 'groq' ? await callGroq(apiKey.trim(), prompt) :
        await callOpenRouter(apiKey.trim(), prompt);
    } catch (err) {
      if (err instanceof LLMError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.statusCode },
        );
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        return NextResponse.json(
          {
            error:
              'LLM request timed out. The model took too long to respond. Please try again.',
          },
          { status: 504 },
        );
      }
      throw err;
    }

    // ── Parse JSON from LLM response ──────────────────────
    const jsonStr = extractJsonFromText(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('[evaluate] Failed to parse LLM JSON. Raw text:', rawText.slice(0, 500));
      return NextResponse.json(
        {
          error:
            'The AI returned a malformed response. Please try again — the model occasionally produces invalid JSON.',
        },
        { status: 502 },
      );
    }

    // ── Validate the result structure ─────────────────────
    try {
      const validatedData = EvaluationResultSchema.parse(parsed);
      
      // LLMs are famously bad at math. We explicitly calculate the overallScore
      // ourselves by summing the 4 pillar scores to ensure it always adds up correctly.
      validatedData.overallScore = 
        validatedData.pillars.openSource.score +
        validatedData.pillars.selfMadeProjects.score +
        validatedData.pillars.productionExperience.score +
        validatedData.pillars.technicalSkills.score;

      return NextResponse.json(validatedData);
    } catch (validationError) {
      console.error('[evaluate] Invalid result structure:', JSON.stringify(parsed).slice(0, 500));
      return NextResponse.json(
        {
          error:
            'The AI response is missing required fields or has incorrect types. Please try again.',
        },
        { status: 502 },
      );
    }
  } catch (err: unknown) {
    console.error('[evaluate] Unexpected error:', err);

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    return NextResponse.json(
      { error: `Evaluation failed: ${message}` },
      { status: 500 },
    );
  }
}
