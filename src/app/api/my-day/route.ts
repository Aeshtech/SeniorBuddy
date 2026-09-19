import { NextRequest, NextResponse } from 'next/server';
import { getMyDay } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const myDay = getMyDay();
    return NextResponse.json(myDay);
  } catch (error) {
    console.error('My Day GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my day' },
      { status: 500 }
    );
  }
}