import { NextRequest, NextResponse } from 'next/server';
import { getAllMedications, createMedication, updateMedication, toggleMedicationTaken, deleteMedication } from '@/lib/db';
import { sanitizeString, sanitizeDateString, checkRateLimit, ValidationError } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`medications:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const meds = getAllMedications();
    return NextResponse.json(meds);
  } catch (error) {
    console.error('Medications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`medications:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();

    const name = sanitizeString(body.name, 'name', { required: true, maxLength: 200 });
    const dosage = sanitizeString(body.dosage, 'dosage', { required: true, maxLength: 100 });
    const frequency = sanitizeString(body.frequency, 'frequency', { maxLength: 100 });
    const instructions = sanitizeString(body.instructions, 'instructions', { maxLength: 500 });
    const refillDate = body.refillDate
      ? sanitizeDateString(body.refillDate, 'refillDate')
      : undefined;

    const timesArray: string[] = Array.isArray(body.times)
      ? body.times.map((t: unknown) => sanitizeString(t, 'times item', { maxLength: 20 })).filter(Boolean)
      : typeof body.times === 'string'
      ? body.times.split(',').map((t: string) => t.trim()).filter(Boolean)
      : ['09:00 AM'];

    const newMed = createMedication(
      name,
      dosage,
      frequency || 'Once daily',
      timesArray,
      instructions || undefined,
      refillDate
    );

    return NextResponse.json(newMed, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Medications POST error:', error);
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`medications:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { id, toggle, ...rawUpdates } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Medication ID is required.' }, { status: 400 });
    }

    // Special toggle shorthand
    if (toggle === true) {
      const updated = toggleMedicationTaken(Number(id));
      if (!updated) return NextResponse.json({ error: 'Medication not found.' }, { status: 404 });
      return NextResponse.json(updated);
    }

    const updates: Record<string, unknown> = {};
    if (rawUpdates.takenToday !== undefined) updates.takenToday = Boolean(rawUpdates.takenToday);
    if (rawUpdates.name) updates.name = sanitizeString(rawUpdates.name, 'name', { maxLength: 200 });
    if (rawUpdates.dosage) updates.dosage = sanitizeString(rawUpdates.dosage, 'dosage', { maxLength: 100 });
    if (rawUpdates.instructions) updates.instructions = sanitizeString(rawUpdates.instructions, 'instructions', { maxLength: 500 });

    const updated = updateMedication(Number(id), updates);
    if (!updated) return NextResponse.json({ error: 'Medication not found.' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Medications PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`medications:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Medication ID is required.' }, { status: 400 });
    }

    deleteMedication(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medications DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
}
