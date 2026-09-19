import { NextRequest, NextResponse } from 'next/server';
import { runAgent, quickAction, AgentMessage } from '@/lib/agent/agent';
import { sanitizeString, checkRateLimit, ValidationError } from '@/lib/security/sanitize';

/** Maximum number of messages in a single conversation payload */
const MAX_MESSAGES = 50;
/** Maximum length of a single message content */
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ─────────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed } = checkRateLimit(`agent:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, action, context } = body;

    // ── Quick action path ─────────────────────────────────────────────
    if (action) {
      const safeAction = sanitizeString(action, 'action', { required: true, maxLength: 200 });
      const safeContext = context
        ? sanitizeString(context, 'context', { maxLength: 1000 })
        : undefined;

      const response = await quickAction(safeAction, safeContext);
      return NextResponse.json(response);
    }

    // ── Full conversation path ────────────────────────────────────────
    if (messages && Array.isArray(messages)) {
      // Limit conversation length to prevent abuse
      if (messages.length > MAX_MESSAGES) {
        return NextResponse.json(
          { error: `Conversation exceeds maximum of ${MAX_MESSAGES} messages.` },
          { status: 400 }
        );
      }

      // Validate and sanitize each message
      const sanitizedMessages: AgentMessage[] = messages.map(
        (msg: Record<string, unknown>, index: number) => {
          const role = msg.role;
          if (role !== 'user' && role !== 'assistant' && role !== 'system') {
            throw new ValidationError(
              `Message #${index + 1} has invalid role "${String(role)}". Must be "user", "assistant", or "system".`
            );
          }

          const content =
            typeof msg.content === 'string' ? msg.content : '';
          if (content.length > MAX_MESSAGE_LENGTH) {
            throw new ValidationError(
              `Message #${index + 1} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`
            );
          }

          return { role, content } as AgentMessage;
        }
      );

      const response = await runAgent(sanitizedMessages);
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide either "messages" array or "action" string.' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}