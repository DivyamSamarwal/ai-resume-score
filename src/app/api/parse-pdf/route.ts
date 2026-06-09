// ============================================================
// API Route: POST /api/parse-pdf
// Extracts text from an uploaded PDF using unpdf (Node.js runtime).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { extractText, getDocumentProxy, resolvePDFJSImport } from 'unpdf';
import type { ParsePdfResponse } from '@/types';

// unpdf relies on Node.js APIs (Buffer, fs internals) — cannot run on Edge
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit

export async function POST(request: NextRequest) {
  try {
    // ── Parse FormData ──────────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request. Expected multipart/form-data.' },
        { status: 400 },
      );
    }

    const file = formData.get('file');

    // ── Validate presence ───────────────────────────────────
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing required "file" field in form data.' },
        { status: 400 },
      );
    }

    // ── Validate MIME type ──────────────────────────────────
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          error: `Invalid file type "${file.type}". Only PDF files are accepted.`,
        },
        { status: 415 },
      );
    }

    // ── Validate file size ──────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File too large (${sizeMB} MB). Maximum allowed size is 2 MB.`,
        },
        { status: 413 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await resolvePDFJSImport();
    const pdf = await getDocumentProxy(uint8Array);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });

    // extractText with mergePages returns text as a single string
    const extractedText = Array.isArray(text) ? text.join('\n') : text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Could not extract any text from this PDF. It may be a scanned image. Please use a text-based PDF.',
        },
        { status: 422 },
      );
    }

    // ── Compute word count ──────────────────────────────────
    const wordCount = extractedText
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;

    // ── Auto-detect GitHub username ─────────────────────────
    const githubMatch = extractedText.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
    const githubUsername = githubMatch ? githubMatch[1].trim() : undefined;

    const response: ParsePdfResponse = {
      text: extractedText,
      pageCount: totalPages,
      wordCount,
      githubUsername,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[parse-pdf] Unexpected error:', err);

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    return NextResponse.json(
      { error: `Failed to parse PDF: ${message}` },
      { status: 500 },
    );
  }
}
