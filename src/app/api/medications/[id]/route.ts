import { NextRequest, NextResponse } from 'next/server';
import { updateMedication, deleteMedication, toggleMedicationTaken } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = parseInt(id, 10);
    const body = await request.json();

    if (body.toggleTaken) {
      const updated = toggleMedicationTaken(numId);
      if (!updated) {
        return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    const updated = updateMedication(numId, body);
    if (!updated) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Medication PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numId = parseInt(id, 10);
    deleteMedication(numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medication DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
}
