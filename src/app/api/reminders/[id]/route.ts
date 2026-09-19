import { NextRequest, NextResponse } from 'next/server';
import { updateReminder, deleteReminder } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = parseInt(id, 10);
    const body = await request.json();

    const reminder = updateReminder(numId, body);
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Reminder PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = parseInt(id, 10);
    deleteReminder(numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminder DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}