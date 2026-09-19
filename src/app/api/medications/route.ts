import { NextRequest, NextResponse } from 'next/server';
import { getAllMedications, createMedication } from '@/lib/db';

export async function GET() {
  try {
    const meds = getAllMedications();
    return NextResponse.json(meds);
  } catch (error) {
    console.error('Medications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, dosage, frequency, times, instructions, refillDate } = body;

    if (!name || !dosage) {
      return NextResponse.json(
        { error: 'Name and dosage are required' },
        { status: 400 }
      );
    }

    const timesArray = Array.isArray(times)
      ? times
      : typeof times === 'string'
      ? times.split(',').map((t: string) => t.trim())
      : ['09:00 AM'];

    const newMed = createMedication(
      name,
      dosage,
      frequency || 'Once daily',
      timesArray,
      instructions,
      refillDate
    );

    return NextResponse.json(newMed, { status: 201 });
  } catch (error) {
    console.error('Medications POST error:', error);
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}
