import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string || 'Analyze this image';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Use OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are SeniorBuddy, a helpful AI assistant for seniors. Your goal is to help seniors understand information in images like bills, documents, or messages.

When analyzing images:
- Provide a simple, clear explanation of what the image shows
- Highlight important information (dates, amounts, deadlines, account numbers)
- Identify any required actions
- Point out potential warning signs if it seems suspicious
- Recommend what the user should do next
- Use simple language - avoid jargon
- Be warm and patient in your response

If the image contains a bill:
- Explain what the bill is for
- Highlight the amount due
- Identify the due date
- Explain any important terms
- Suggest if a reminder is needed

If the image contains a document or notice:
- Summarize what it's about
- Highlight deadlines or required actions
- Explain any confusing parts
- Suggest next steps`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: context || 'Please analyze this image and explain what it shows in simple terms.'
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const analysis = response.choices[0].message.content;

    return NextResponse.json({
      success: true,
      analysis,
      fileName: file.name,
      fileType: file.type
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}