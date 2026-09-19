import {
  createReminder,
  getMyDay,
  createMedication,
  getAllMedications,
  toggleMedicationTaken,
  createAppointment,
  createBill,
  getAllBills,
} from '../db';
import { format } from 'date-fns';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export async function createReminderTool(title: string, dueDate: string, description?: string): Promise<ToolResult> {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let normalizedDueDate = dueDate;

    if (!dueDate || typeof dueDate !== 'string') {
      normalizedDueDate = `${todayStr}T14:00`;
    } else {
      const lower = dueDate.toLowerCase().trim();
      if (lower.includes('afternoon') || lower.includes('pm')) {
        normalizedDueDate = `${todayStr}T14:00`;
      } else if (lower.includes('morning') || lower.includes('am')) {
        normalizedDueDate = `${todayStr}T09:00`;
      } else if (lower.includes('evening') || lower.includes('night')) {
        normalizedDueDate = `${todayStr}T18:30`;
      } else if (lower === 'today' || lower === 'now') {
        normalizedDueDate = `${todayStr}T12:00`;
      } else if (!lower.includes('-')) {
        normalizedDueDate = `${todayStr} ${dueDate}`;
      }
    }

    const reminder = createReminder(title, description, normalizedDueDate);
    return {
      success: true,
      data: reminder,
      message: `Created reminder for "${title}" scheduled for ${normalizedDueDate}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reminder',
    };
  }
}

export async function getMyDayTool(): Promise<ToolResult> {
  try {
    const myDay = getMyDay();
    return {
      success: true,
      data: myDay,
      message: `Retrieved today's schedule: ${myDay.medications.length} medications, ${myDay.appointments.length} appointments, ${myDay.reminders.length} reminders.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve day plan',
    };
  }
}

export async function addMedicationTool(
  name: string,
  dosage: string,
  frequency: string,
  times: string[],
  instructions?: string
): Promise<ToolResult> {
  try {
    const med = createMedication(name, dosage, frequency, times, instructions);
    return {
      success: true,
      data: med,
      message: `Added medication ${name} (${dosage}) to your daily tracker.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add medication',
    };
  }
}

export async function getMedicationsTool(): Promise<ToolResult> {
  try {
    const meds = getAllMedications();
    return {
      success: true,
      data: meds,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get medications',
    };
  }
}

export async function toggleMedicationTool(id: number): Promise<ToolResult> {
  try {
    const med = toggleMedicationTaken(id);
    if (!med) {
      return { success: false, error: 'Medication not found' };
    }
    return {
      success: true,
      data: med,
      message: med.takenToday
        ? `Marked ${med.name} as taken! Great job staying healthy.`
        : `Marked ${med.name} as not yet taken.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle medication',
    };
  }
}

export async function addAppointmentTool(
  title: string,
  date: string,
  time?: string,
  location?: string,
  description?: string
): Promise<ToolResult> {
  try {
    const appointment = createAppointment(title, description, date, time, location);
    return {
      success: true,
      data: appointment,
      message: `Booked appointment "${title}" on ${date} at ${time || 'unspecified time'}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create appointment',
    };
  }
}

export async function logBillTool(
  title: string,
  vendor: string,
  amount: number,
  dueDate: string,
  category?: 'utility' | 'medical' | 'phone' | 'subscription' | 'other'
): Promise<ToolResult> {
  try {
    const bill = createBill(title, vendor, amount, dueDate, false, category || 'utility');
    return {
      success: true,
      data: bill,
      message: `Logged bill from ${vendor} for $${amount.toFixed(2)} due on ${dueDate}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log bill',
    };
  }
}

export async function getBillsTool(): Promise<ToolResult> {
  try {
    const bills = getAllBills();
    return {
      success: true,
      data: bills,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get bills',
    };
  }
}

export async function safetyCheck(message: string): Promise<ToolResult> {
  // Let the LLM analyze suspicious indicators
  const suspiciousKeywords = [
    'urgent',
    'wire money',
    'gift card',
    'irs',
    'bank account suspended',
    'lottery',
    'winner',
    'send otp',
    'crypto',
    'remote access',
    'anydesk',
    'teamviewer',
    'arrest warrant',
  ];

  const lower = message.toLowerCase();
  const matched = suspiciousKeywords.filter((k) => lower.includes(k));

  return {
    success: true,
    data: {
      hasRedFlags: matched.length > 0,
      detectedRedFlags: matched,
      analysisRecommendation: matched.length > 0
        ? 'High probability of fraudulent solicitation or scam.'
        : 'Requires standard verification caution.',
    },
  };
}

export const toolDefinitions = [
  {
    type: 'function' as const,
    function: {
      name: 'get_my_day',
      description: "Retrieve senior's complete day schedule including pills/medications, appointments, and reminders.",
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_reminder',
      description: 'Create a reminder with a title, due date/time, and friendly description.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What to remind about (e.g. Call grandson, Take morning walk)' },
          dueDate: { type: 'string', description: 'Due date in ISO or YYYY-MM-DD format, or with time YYYY-MM-DDTHH:mm' },
          description: { type: 'string', description: 'Helpful context or instructions' },
        },
        required: ['title', 'dueDate'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_medication',
      description: 'Add a new medication pill reminder with dosage, timing, and meal instructions.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Medication name (e.g. Lisinopril, Metformin)' },
          dosage: { type: 'string', description: 'Dosage like 10mg, 1 tablet' },
          frequency: { type: 'string', description: 'e.g. Once daily, Twice daily' },
          times: {
            type: 'array',
            items: { type: 'string' },
            description: "Times of day, e.g. ['08:00 AM', '08:00 PM']",
          },
          instructions: { type: 'string', description: 'e.g. Take after breakfast with water' },
        },
        required: ['name', 'dosage'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_medications',
      description: 'List all prescribed medications and see if they were taken today.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'toggle_medication',
      description: 'Mark a medication pill as taken (or untaken) by its numeric ID.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'The medication ID' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_appointment',
      description: 'Schedule a doctor appointment, clinic visit, or family meet-up.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Appointment title (e.g. Cardiologist Dr. Sharma)' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time (e.g. 10:30 AM)' },
          location: { type: 'string', description: 'Clinic name, address, or room' },
          description: { type: 'string', description: 'What to bring or special notes' },
        },
        required: ['title', 'date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'log_bill',
      description: 'Log an upcoming or received bill (electricity, water, medical, phone).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Bill description' },
          vendor: { type: 'string', description: 'Company or provider' },
          amount: { type: 'number', description: 'Total amount in dollars' },
          dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD' },
          category: {
            type: 'string',
            enum: ['utility', 'medical', 'phone', 'subscription', 'other'],
            description: 'Bill category',
          },
        },
        required: ['title', 'vendor', 'amount', 'dueDate'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_bills',
      description: 'Get the list of active bills to see amounts and upcoming payment due dates.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'safety_check',
      description: 'Check a suspicious SMS, email, caller request, or letter for fraud, scams, or identity theft risks.',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'The suspicious message, text, or caller pitch to evaluate' },
        },
        required: ['message'],
      },
    },
  },
];

export async function executeTool(toolName: string, args: any): Promise<ToolResult> {
  switch (toolName) {
    case 'get_my_day':
      return getMyDayTool();
    case 'create_reminder':
      return createReminderTool(args.title, args.dueDate, args.description);
    case 'add_medication':
      return addMedicationTool(
        args.name,
        args.dosage,
        args.frequency || 'Once daily',
        args.times || ['09:00 AM'],
        args.instructions
      );
    case 'get_medications':
      return getMedicationsTool();
    case 'toggle_medication':
      return toggleMedicationTool(Number(args.id));
    case 'add_appointment':
      return addAppointmentTool(args.title, args.date, args.time, args.location, args.description);
    case 'log_bill':
      return logBillTool(args.title, args.vendor, Number(args.amount), args.dueDate, args.category);
    case 'get_bills':
      return getBillsTool();
    case 'safety_check':
      return safetyCheck(args.message);
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}