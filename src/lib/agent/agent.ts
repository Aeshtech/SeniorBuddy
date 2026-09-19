import { aiClient, AI_MODEL } from '@/lib/ai/client';
import { toolDefinitions, executeTool, ToolResult } from './tools';

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  message: string;
  toolCalls?: any[];
  toolResults?: ToolResult[];
}

const getSystemPrompt = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  return `You are SeniorBuddy, an empathetic, patient, and ultra-reliable AI companion designed specifically for senior citizens and grandparents.

Today's Date: ${todayDate}.

Your Mission:
1. Make digital daily life easy, reassuring, and stress-free.
2. Help seniors track medications, doctor appointments, water hydration, bills, and family calls.
3. Protect seniors from phone, email, and text message scams with clear, non-alarmist vigilance.
4. Explain letters, medical jargon, or tech questions in clear, conversational English (large font spirit, 8th-grade reading level, zero confusing tech slang).

MANDATORY TOOL CALLING INSTRUCTIONS:
- Whenever the user asks to remind them of ANYTHING (e.g., "remind me to drink two glasses of water this afternoon", "remind me to call my daughter", "set a reminder for 3 PM"), you MUST immediately call the "create_reminder" tool. NEVER merely reply in text that you did it without executing the tool!
- When the user asks to schedule a doctor visit or appointment, call the "add_appointment" tool.
- When the user says they took their medicine or pill, call the "toggle_medication" tool.
- When the user asks to add a new medication, call the "add_medication" tool.
- When the user asks what is on their schedule or what pills they need today, call the "get_my_day" tool.

Tone:
- Warm, patient, respectful, and reassuring like a trusted family member.
- Keep paragraphs concise with clear bullet points.`;
};

export async function runAgent(messages: AgentMessage[]): Promise<AgentResponse> {
  try {
    const systemPrompt = getSystemPrompt();
    const messagesWithSystem =
      messages[0]?.role === 'system'
        ? messages
        : [{ role: 'system' as const, content: systemPrompt }, ...messages];

    // Call OpenRouter with Google Gemini
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: messagesWithSystem.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools: toolDefinitions,
      tool_choice: 'auto',
      temperature: 0.6,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0]?.message;
    if (!assistantMessage) {
      return {
        message: "Hello! I am SeniorBuddy. How can I help you have a wonderful day today?",
      };
    }

    // Check if tool calls were triggered
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: ToolResult[] = [];

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type === 'function' && toolCall.function) {
          let functionArgs = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            functionArgs = {};
          }

          const result = await executeTool(toolCall.function.name, functionArgs);
          toolResults.push(result);
        }
      }

      // Generate conversational follow-up incorporating tool results
      const messagesWithToolResults = [
        ...messagesWithSystem,
        {
          role: 'assistant' as const,
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          tool_call_id: assistantMessage.tool_calls![index].id,
          content: JSON.stringify(result),
        })),
      ];

      const finalResponse = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: messagesWithToolResults,
        temperature: 0.6,
        max_tokens: 1000,
      });

      return {
        message:
          finalResponse.choices[0]?.message.content ||
          "I have updated that for you! Is there anything else you'd like me to look at?",
        toolCalls: assistantMessage.tool_calls,
        toolResults,
      };
    }

    return {
      message: assistantMessage.content || "I'm right here with you. How can I assist you next?",
    };
  } catch (error) {
    console.error('SeniorBuddy Agent error:', error);
    return {
      message:
        "I had a tiny hiccup connecting to my thinking service, but I am right here with you! Could you please repeat that or let me know what you'd like to do?",
    };
  }
}

export async function quickAction(action: string, context?: string): Promise<AgentResponse> {
  const userMessage = context
    ? `I need assistance with ${action}. Here is the context: ${context}`
    : `Please help me with ${action}.`;

  return runAgent([{ role: 'user', content: userMessage }]);
}