import { NextRequest, NextResponse } from 'next/server';
import { getMyDay } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`my-day:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const myDay = getMyDay();

    // Cache-Control: private, short cache for dashboard freshness
    const response = NextResponse.json(myDay);
    response.headers.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=10');
    return response;
  } catch (error) {
    console.error('My Day GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my day' },
      { status: 500 }
    );
  }
}