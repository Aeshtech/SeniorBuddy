import { NextRequest, NextResponse } from 'next/server';
import { createReminder, getAllReminders, getActiveReminders, updateReminder, deleteReminder } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';

    const reminders = active ? getActiveReminders() : getAllReminders();
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Reminders GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dueDate } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and dueDate are required' },
        { status: 400 }
      );
    }

    const reminder = createReminder(title, description, dueDate);
    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error('Reminders POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}