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

export interface MyDay {
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
}