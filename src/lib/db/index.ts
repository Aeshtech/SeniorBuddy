import Database from 'better-sqlite3';
import { Reminder, Task, Appointment, MyDay } from './schema';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

const dbPath = process.env.DATABASE_PATH || './senior-buddy.db';
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TEXT,
    completed INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Reminder functions
export function createReminder(title: string, description: string | undefined, dueDate: string): Reminder {
  const stmt = db.prepare(`
    INSERT INTO reminders (title, description, dueDate, completed, createdAt)
    VALUES (?, ?, ?, 0, datetime('now'))
  `);
  const result = stmt.run(title, description, dueDate);
  return getReminderById(result.lastInsertRowid as number);
}

export function getReminderById(id: number): Reminder {
  const stmt = db.prepare('SELECT * FROM reminders WHERE id = ?');
  const reminder = stmt.get(id) as Reminder;
  return reminder;
}

export function getAllReminders(): Reminder[] {
  const stmt = db.prepare('SELECT * FROM reminders ORDER BY dueDate ASC');
  return stmt.all() as Reminder[];
}

export function getActiveReminders(): Reminder[] {
  const stmt = db.prepare('SELECT * FROM reminders WHERE completed = 0 ORDER BY dueDate ASC');
  return stmt.all() as Reminder[];
}

export function updateReminder(id: number, updates: Partial<Reminder>): Reminder {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.dueDate !== undefined) {
    fields.push('dueDate = ?');
    values.push(updates.dueDate);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  if (fields.length === 0) return getReminderById(id);

  values.push(id);
  const stmt = db.prepare(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getReminderById(id);
}

export function deleteReminder(id: number): void {
  const stmt = db.prepare('DELETE FROM reminders WHERE id = ?');
  stmt.run(id);
}

// Task functions
export function createTask(title: string, description: string | undefined, dueDate: string | undefined): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, dueDate, completed, createdAt)
    VALUES (?, ?, ?, 0, datetime('now'))
  `);
  const result = stmt.run(title, description, dueDate);
  return getTaskById(result.lastInsertRowid as number);
}

export function getTaskById(id: number): Task {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id) as Task;
}

export function getAllTasks(): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY dueDate ASC');
  return stmt.all() as Task[];
}

export function getActiveTasks(): Task[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE completed = 0 ORDER BY dueDate ASC');
  return stmt.all() as Task[];
}

export function updateTask(id: number, updates: Partial<Task>): Task {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.dueDate !== undefined) {
    fields.push('dueDate = ?');
    values.push(updates.dueDate);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  if (fields.length === 0) return getTaskById(id);

  values.push(id);
  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getTaskById(id);
}

export function deleteTask(id: number): void {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
}

// Appointment functions
export function createAppointment(title: string, description: string | undefined, date: string, time: string | undefined, location: string | undefined): Appointment {
  const stmt = db.prepare(`
    INSERT INTO appointments (title, description, date, time, location, createdAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(title, description, date, time, location);
  return getAppointmentById(result.lastInsertRowid as number);
}

export function getAppointmentById(id: number): Appointment {
  const stmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
  return stmt.get(id) as Appointment;
}

export function getAllAppointments(): Appointment[] {
  const stmt = db.prepare('SELECT * FROM appointments ORDER BY date ASC, time ASC');
  return stmt.all() as Appointment[];
}

export function updateAppointment(id: number, updates: Partial<Appointment>): Appointment {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.time !== undefined) {
    fields.push('time = ?');
    values.push(updates.time);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }

  if (fields.length === 0) return getAppointmentById(id);

  values.push(id);
  const stmt = db.prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
  return getAppointmentById(id);
}

export function deleteAppointment(id: number): void {
  const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
  stmt.run(id);
}

// My Day functions
export function getMyDay(): MyDay {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const allReminders = getActiveReminders();
  const allTasks = getActiveTasks();
  const allAppointments = getAllAppointments();

  // Filter for today, tomorrow, and this week
  const importantReminders = allReminders.filter(r => {
    const dueDate = new Date(r.dueDate);
    return isToday(dueDate) || isTomorrow(dueDate) || isThisWeek(dueDate);
  });

  const importantTasks = allTasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return isToday(dueDate) || isTomorrow(dueDate) || isThisWeek(dueDate);
  });

  const upcomingAppointments = allAppointments.filter(a => {
    const appointmentDate = new Date(a.date);
    return !isToday(appointmentDate) || (isToday(appointmentDate) && a.time);
  });

  return {
    reminders: importantReminders,
    tasks: importantTasks,
    appointments: upcomingAppointments
  };
}

export default db;