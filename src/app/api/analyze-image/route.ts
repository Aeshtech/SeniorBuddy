import { NextRequest, NextResponse } from 'next/server';
import { aiClient, AI_MODEL } from '@/lib/ai/client';
import { createBill } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = (formData.get('context') as string) || 'Analyze this document or bill for a senior citizen';
    const autoSave = formData.get('autoSave') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

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
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${context}. Please extract all details carefully, check if it's safe or a scam, and summarize in simple terms.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    let structuredData: any = {};

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
    if (autoSave && structuredData.amountDue !== null && structuredData.amountDue > 0) {
      try {
        savedBill = createBill(
          structuredData.title || file.name,
          structuredData.vendor || 'Unknown Vendor',
          Number(structuredData.amountDue),
          structuredData.dueDate || new Date().toISOString().split('T')[0],
          false,
          'utility',
          structuredData.summary,
          structuredData.accountNumber || undefined,
          structuredData.confidenceScore || 0.95
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