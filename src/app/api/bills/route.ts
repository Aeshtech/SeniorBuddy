import { NextRequest, NextResponse } from 'next/server';
import { getAllBills, createBill, updateBill, deleteBill } from '@/lib/db';
import {
  sanitizeString,
  sanitizeAmount,
  sanitizeDateString,
  sanitizeBillCategory,
  checkRateLimit,
  ValidationError,
} from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`bills:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const bills = getAllBills();
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Bills GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`bills:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();

    // Sanitize & validate all fields
    const title = sanitizeString(body.title, 'title', { required: true, maxLength: 200 });
    const vendor = sanitizeString(body.vendor, 'vendor', { required: true, maxLength: 200 });
    const amount = sanitizeAmount(body.amount);
    const dueDate = sanitizeDateString(body.dueDate);
    const isPaid = Boolean(body.isPaid);
    const category = sanitizeBillCategory(body.category);
    const notes = sanitizeString(body.notes, 'notes', { maxLength: 500 });
    const invoiceNumber = sanitizeString(body.invoiceNumber, 'invoiceNumber', { maxLength: 100 });

    const newBill = createBill(
      title,
      vendor,
      amount,
      dueDate,
      isPaid,
      category,
      notes || undefined,
      invoiceNumber || undefined
    );

    return NextResponse.json(newBill, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Bills POST error:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`bills:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Bill ID is required.' }, { status: 400 });
    }

    // Sanitize any provided update fields
    const updates: Record<string, unknown> = {};
    if (rawUpdates.isPaid !== undefined) updates.isPaid = Boolean(rawUpdates.isPaid);
    if (rawUpdates.title) updates.title = sanitizeString(rawUpdates.title, 'title', { maxLength: 200 });
    if (rawUpdates.notes) updates.notes = sanitizeString(rawUpdates.notes, 'notes', { maxLength: 500 });
    if (rawUpdates.amount !== undefined) updates.amount = sanitizeAmount(rawUpdates.amount);

    const updated = updateBill(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ error: 'Bill not found.' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Bills PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`bills:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Valid numeric Bill ID is required.' }, { status: 400 });
    }

    deleteBill(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bills DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}
