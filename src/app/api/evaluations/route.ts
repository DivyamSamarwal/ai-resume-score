import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { EvaluationResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, result }: { label: string; result: EvaluationResult } = body;

    if (!label || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
    }

    // Insert into DB
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        label,
        score: result.overallScore,
        result_data: result,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[supabase] insert error:', error);
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[evaluations-api] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('result_data, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 });
    }

    return NextResponse.json({
      result: data.result_data,
      createdAt: data.created_at,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
