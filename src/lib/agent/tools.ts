import { createReminder, getMyDay } from '../db';
import { format } from 'date-fns';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Tool: analyze_message
export async function analyzeMessage(message: string): Promise<ToolResult> {
  try {
    // This will be processed by the AI agent
    // For now, return structured data that the AI can use
    return {
      success: true,
      data: {
        message,
        analyzed: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze message'
    };
  }
}

// Tool: create_reminder
export async function createReminderTool(title: string, dueDate: string, description?: string): Promise<ToolResult> {
  try {
    const reminder = createReminder(title, description, dueDate);
    return {
      success: true,
      data: reminder
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reminder'
    };
  }
}

// Tool: get_my_day
export async function getMyDayTool(): Promise<ToolResult> {
  try {
    const myDay = getMyDay();
    return {
      success: true,
      data: myDay
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get my day'
    };
  }
}

// Tool: search_information
export async function searchInformation(query: string): Promise<ToolResult> {
  try {
    // This would connect to real APIs in production
    // For hackathon, we'll provide basic information
    return {
      success: true,
      data: {
        query,
        information: `Information about "${query}" - this would connect to real APIs in production`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search information'
    };
  }
}

// Tool: safety_check
export async function safetyCheck(message: string): Promise<ToolResult> {
  try {
    // This will be processed by the AI agent to identify warning signs
    return {
      success: true,
      data: {
        message,
        checked: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform safety check'
    };
  }
}

// Tool definitions for OpenAI
export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "analyze_message",
      description: "Analyze a message, email, or notice and provide simple explanation, important information, required actions, dates/deadlines, and potential warning signs",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The message, email, or notice text to analyze"
          }
        },
        required: ["message"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_reminder",
      description: "Create a reminder from natural language. Extract title, due date, and optional description",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title or summary of the reminder"
          },
          dueDate: {
            type: "string",
            description: "The due date in ISO format (YYYY-MM-DD) or natural language that can be parsed"
          },
          description: {
            type: "string",
            description: "Optional detailed description of the reminder"
          }
        },
        required: ["title", "dueDate"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_my_day",
      description: "Retrieve the user's upcoming tasks, reminders, appointments, and important dates",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "search_information",
      description: "Search for relevant information when the user asks about something specific",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query or topic the user wants information about"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "safety_check",
      description: "Analyze potentially suspicious messages and explain warning signs, what to avoid, and how to verify safely",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The suspicious message to analyze"
          }
        },
        required: ["message"]
      }
    }
  }
];

// Tool execution handler
export async function executeTool(toolName: string, args: any): Promise<ToolResult> {
  switch (toolName) {
    case 'analyze_message':
      return analyzeMessage(args.message);
    case 'create_reminder':
      return createReminderTool(args.title, args.dueDate, args.description);
    case 'get_my_day':
      return getMyDayTool();
    case 'search_information':
      return searchInformation(args.query);
    case 'safety_check':
      return safetyCheck(args.message);
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`
      };
  }
}