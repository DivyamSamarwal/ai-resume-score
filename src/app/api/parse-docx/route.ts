import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import type { ParsePdfResponse } from '@/types';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB limit

export async function POST(request: NextRequest) {
  try {
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

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing required "file" field in form data.' },
        { status: 400 },
      );
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        !file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Only DOCX files are accepted here.` },
        { status: 415 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large (${sizeMB} MB). Maximum allowed size is 4 MB.` },
        { status: 413 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text using Mammoth
    const result = await mammoth.extractRawText({ buffer });
    const extractedText = result.value;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any text from this Word document. It may be empty or contain only images.' },
        { status: 422 },
      );
    }

    const wordCount = extractedText
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;

    const githubMatch = extractedText.match(/github\.com\/([A-Za-z0-9_.-]+)/i);
    const githubUsername = githubMatch ? githubMatch[1].trim() : undefined;

    const response: ParsePdfResponse = {
      text: extractedText,
      pageCount: 1, // Mammoth doesn't do pagination, default to 1
      wordCount,
      githubUsername,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[parse-docx] Unexpected error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json(
      { error: `Failed to parse DOCX: ${message}` },
      { status: 500 },
    );
  }
}
