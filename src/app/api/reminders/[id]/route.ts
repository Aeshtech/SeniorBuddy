import { NextRequest, NextResponse } from 'next/server';
import { updateReminder, deleteReminder } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const reminder = updateReminder(id, body);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    deleteReminder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reminder DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}