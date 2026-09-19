import { NextRequest, NextResponse } from 'next/server';
import { runAgent, quickAction, AgentMessage } from '@/lib/agent/agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action, context } = body;

    if (action) {
      // Handle quick action
      const response = await quickAction(action, context);
      return NextResponse.json(response);
    }

    if (messages && Array.isArray(messages)) {
      // Handle full conversation
      const response = await runAgent(messages);
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide either "messages" array or "action" string.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}