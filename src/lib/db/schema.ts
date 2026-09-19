export interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface Appointment {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  createdAt: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string; // e.g., 'Once daily', 'Twice daily', 'With dinner'
  times: string[]; // e.g., ['08:00 AM', '08:00 PM']
  instructions?: string; // e.g. 'Take after breakfast with water'
  takenToday: boolean;
  refillDate?: string;
  createdAt: string;
}

export interface BillRecord {
  id: number;
  title: string;
  vendor: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category?: 'utility' | 'medical' | 'phone' | 'subscription' | 'other';
  notes?: string;
  invoiceNumber?: string;
  confidenceScore?: number;
  createdAt: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface SafetyCheckResult {
  id: number;
  inputType: 'text' | 'image';
  summary: string;
  riskLevel: 'safe' | 'caution' | 'dangerous';
  score: number; // 0 (scam) to 100 (safe)
  explanation: string;
  advice: string;
  createdAt: string;
}

export interface MyDay {
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
  medications: Medication[];
}