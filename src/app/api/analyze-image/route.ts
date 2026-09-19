import { NextRequest, NextResponse } from 'next/server';
import { aiClient, AI_MODEL } from '@/lib/ai/client';
import { createBill } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/sanitize';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
]);
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`analyze-image:${ip}`);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = (formData.get('context') as string) || 'Analyze this document or bill for a senior citizen';
    const autoSave = formData.get('autoSave') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // ── Security: validate file type ─────────────────────────────────────
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type "${file.type}". Only image files (JPEG, PNG, WebP, GIF) are allowed.` },
        { status: 400 }
      );
    }

    // ── Security: validate file size ─────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is ${MAX_FILE_SIZE_MB} MB.` },
        { status: 400 }
      );
    }

    // ── Security: sanitize context string (no HTML injection) ─────────────
    const safeContext = context.replace(/<[^>]*>/g, '').replace(/[<>'"`;]/g, '').trim().slice(0, 300);

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const systemPrompt = `You are SeniorBuddy's Document & Vision Specialist.
Your job is to read images of bills, medical prescriptions, letters, and notices uploaded by seniors and explain them in simple, reassuring terms.

Always output a JSON object with this exact structure:
{
  "documentType": "bill" | "medical" | "notice" | "suspicious" | "other",
  "title": "Short title describing the document",
  "vendor": "Company or Provider name if identifiable (or 'Unknown')",
  "amountDue": number or null (e.g. 84.50),
  "dueDate": "YYYY-MM-DD or readable date string if found",
  "accountNumber": "Account or invoice number if visible, or null",
  "summary": "2-3 short, clear sentences explaining what this document is in plain English",
  "keyHighlights": ["Point 1 in plain terms", "Point 2", "Point 3"],
  "actionNeeded": "What the senior should do next (e.g., 'Pay $84.50 before Nov 15th' or 'No payment required - keep for records')",
  "isSuspicious": boolean,
  "suspicionReason": "Explanation if it looks like a scam, fake invoice, or phishing attempt, else null",
  "confidenceScore": number between 0.0 and 1.0
}

Respond ONLY with the valid JSON object, without markdown formatting or code fences.`;

    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${safeContext}. Please extract all details carefully, check if it's safe or a scam, and summarize in simple terms.`,
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    let structuredData: Record<string, unknown> = {};

    try {
      const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      structuredData = JSON.parse(cleaned);
    } catch {
      structuredData = {
        documentType: 'other',
        title: file.name || 'Uploaded Document',
        vendor: 'Unknown Provider',
        amountDue: null,
        dueDate: null,
        summary: rawContent,
        keyHighlights: ['Document analyzed by SeniorBuddy'],
        actionNeeded: 'Review document with family or trusted helper if unsure.',
        isSuspicious: false,
        confidenceScore: 0.85,
      };
    }

    // Auto-save bill to store if requested and it is a bill
    let savedBill = null;
    if (autoSave && structuredData.amountDue !== null && Number(structuredData.amountDue) > 0) {
      try {
        savedBill = createBill(
          String(structuredData.title || file.name).slice(0, 200),
          String(structuredData.vendor || 'Unknown Vendor').slice(0, 200),
          Number(structuredData.amountDue),
          String(structuredData.dueDate || new Date().toISOString().split('T')[0]),
          false,
          'utility',
          String(structuredData.summary || '').slice(0, 500),
          structuredData.accountNumber ? String(structuredData.accountNumber).slice(0, 100) : undefined,
          typeof structuredData.confidenceScore === 'number' ? structuredData.confidenceScore : 0.95
        );
      } catch (err) {
        console.error('Failed to auto-save bill:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: structuredData,
      analysis: structuredData.summary,
      savedBill,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image with vision AI' },
      { status: 500 }
    );
  }
}