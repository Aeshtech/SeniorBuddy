import { NextRequest, NextResponse } from 'next/server';
import { getAllBills, createBill, updateBill, deleteBill } from '@/lib/db';

export async function GET() {
  try {
    const bills = getAllBills();
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Bills GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, vendor, amount, dueDate, isPaid, category, notes, invoiceNumber } = body;

    if (!title || !vendor || amount === undefined || !dueDate) {
      return NextResponse.json(
        { error: 'title, vendor, amount, and dueDate are required' },
        { status: 400 }
      );
    }

    const newBill = createBill(
      title,
      vendor,
      Number(amount),
      dueDate,
      Boolean(isPaid),
      category || 'utility',
      notes,
      invoiceNumber
    );

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    console.error('Bills POST error:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    const updated = updateBill(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Bills PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 });
    }

    deleteBill(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bills DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}
