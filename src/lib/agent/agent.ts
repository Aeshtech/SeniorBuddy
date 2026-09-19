import OpenAI from 'openai';
import { toolDefinitions, executeTool, ToolResult } from './tools';

// Initialize OpenAI client with compatible API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
});

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  message: string;
  toolCalls?: any[];
  toolResults?: ToolResult[];
}

const systemPrompt = `You are SeniorBuddy, a helpful AI assistant for seniors. Your goal is to help seniors understand information, identify what needs attention, decide what to do next, and stay organized.

Key behaviors:
- Use simple, clear language - avoid jargon
- Be patient and understanding
- Ask for clarification when needed
- Always explain what you're doing and why
- Break down complex information into simple steps
- Suggest next actions when appropriate
- Ask for confirmation before consequential actions
- Be warm and friendly, like a helpful friend

When analyzing messages or documents:
- Provide a simple explanation of what it means
- Highlight important information (dates, amounts, deadlines)
- Identify any required actions
- Point out potential warning signs if it seems suspicious
- Recommend what the user should do next

When creating reminders:
- Confirm the details before saving
- Use clear, specific titles
- Include relevant details in the description

When helping with safety:
- Never claim certainty when evidence is unclear
- Explain warning signs in simple terms
- Suggest how to verify information safely
- Recommend what to avoid

Your tone should be warm, patient, and reassuring. You're here to help make technology easier and safer for seniors.`;

export async function runAgent(messages: AgentMessage[]): Promise<AgentResponse> {
  try {
    // Add system prompt if not present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system' as const, content: systemPrompt }, ...messages];

    // Call OpenAI API with tools
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messagesWithSystem.map(m => ({
        role: m.role,
        content: m.content
      })),
      tools: toolDefinitions,
      tool_choice: 'auto'
    });

    const assistantMessage = response.choices[0].message;
    
    // Check if the model wants to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: ToolResult[] = [];
      
      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await executeTool(functionName, functionArgs);
        toolResults.push(result);
      }

      // Get final response with tool results
      const messagesWithToolResults = [
        ...messagesWithSystem,
        {
          role: 'assistant' as const,
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          tool_call_id: assistantMessage.tool_calls![index].id,
          content: JSON.stringify(result)
        }))
      ];

      const finalResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: messagesWithToolResults
      });

      return {
        message: finalResponse.choices[0].message.content || 'I apologize, but I encountered an issue processing your request.',
        toolCalls: assistantMessage.tool_calls,
        toolResults
      };
    }

    return {
      message: assistantMessage.content || 'I apologize, but I encountered an issue processing your request.'
    };

  } catch (error) {
    console.error('Agent error:', error);
    return {
      message: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.'
    };
  }
}

export async function quickAction(action: string, context?: string): Promise<AgentResponse> {
  const userMessage = context 
    ? `I need help with ${action}. Here's the context: ${context}`
    : `I need help with ${action}.`;

  return runAgent([
    { role: 'user', content: userMessage }
  ]);
}