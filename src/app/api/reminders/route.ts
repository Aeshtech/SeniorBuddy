import { NextRequest, NextResponse } from 'next/server';
import { createReminder, getAllReminders, getActiveReminders, updateReminder, deleteReminder } from '@/lib/db';
import { sanitizeString, sanitizeDateString, checkRateLimit, ValidationError } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`reminders:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';
    const reminders = active ? getActiveReminders() : getAllReminders();
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Reminders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`reminders:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();

    const title = sanitizeString(body.title, 'title', { required: true, maxLength: 200 });
    const description = sanitizeString(body.description, 'description', { maxLength: 500 });
    const dueDate = sanitizeDateString(body.dueDate);

    const reminder = createReminder(title, description || undefined, dueDate);
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Reminders POST error:', error);
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`reminders:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Reminder ID is required.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (rawUpdates.completed !== undefined) updates.completed = Boolean(rawUpdates.completed);
    if (rawUpdates.title) updates.title = sanitizeString(rawUpdates.title, 'title', { maxLength: 200 });
    if (rawUpdates.description) updates.description = sanitizeString(rawUpdates.description, 'description', { maxLength: 500 });

    const updated = updateReminder(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ error: 'Reminder not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Reminders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`reminders:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Reminder ID is required.' }, { status: 400 });
    }

    deleteReminder(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminders DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}