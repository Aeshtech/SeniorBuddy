import { Reminder, Task, Appointment, Medication, BillRecord, EmergencyContact, MyDay } from './schema';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface DatabaseStore {
  reminders: Map<number, Reminder>;
  tasks: Map<number, Task>;
  appointments: Map<number, Appointment>;
  medications: Map<number, Medication>;
  bills: Map<number, BillRecord>;
  emergencyContacts: Map<number, EmergencyContact>;
  nextId: {
    reminders: number;
    tasks: number;
    appointments: number;
    medications: number;
    bills: number;
    emergencyContacts: number;
  };
}

// Global persistence across hot reload in development & single lambda instance
const globalForDb = globalThis as unknown as { __seniorBuddyStore?: DatabaseStore };

function initStore(): DatabaseStore {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const reminders = new Map<number, Reminder>([
    [
      1,
      {
        id: 1,
        title: 'Drink 2 glasses of warm water',
        description: 'Morning hydration routine recommended by Dr. Sharma',
        dueDate: `${todayStr}T09:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
    [
      2,
      {
        id: 2,
        title: 'Call daughter Sarah',
        description: 'Weekly Sunday catch-up call and share garden photos',
        dueDate: `${todayStr}T17:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
    [
      3,
      {
        id: 3,
        title: 'Evening 20-min gentle walk in the park',
        description: 'Wear comfortable walking shoes and carry walking cane',
        dueDate: `${todayStr}T18:30`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  const tasks = new Map<number, Task>([
    [
      1,
      {
        id: 1,
        title: 'Water the balcony ferns & roses',
        description: 'Water lightly before the afternoon sun',
        dueDate: `${todayStr}T10:30`,
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ],
    [
      2,
      {
        id: 2,
        title: 'Sort out morning newspaper for reading',
        description: 'Solve the crossword puzzle',
        dueDate: `${todayStr}T11:00`,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  const appointments = new Map<number, Appointment>([
    [
      1,
      {
        id: 1,
        title: 'Dr. Sharma - Routine Blood Pressure & Heart Checkup',
        description: 'Bring recent BP log notebook and list of current medicines',
        date: todayStr,
        time: '11:30 AM',
        location: 'City Heart Clinic, Room 204 (Elevator available)',
        createdAt: new Date().toISOString(),
      },
    ],
    [
      2,
      {
        id: 2,
        title: 'Eye Care Vision Checkup with Dr. Patel',
        description: 'Annual cataract follow-up and new reading glass prescription',
        date: tomorrowStr,
        time: '03:00 PM',
        location: 'Metro Eye Care Center, 4th Floor',
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  const medications = new Map<number, Medication>([
    [
      1,
      {
        id: 1,
        name: 'Amlodipine (Blood Pressure)',
        dosage: '5 mg',
        frequency: 'Once daily',
        times: ['08:30 AM'],
        instructions: 'Take with a glass of water after breakfast',
        takenToday: true,
        refillDate: '2026-10-15',
        createdAt: new Date().toISOString(),
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'Metformin (Blood Sugar)',
        dosage: '500 mg',
        frequency: 'Twice daily',
        times: ['09:00 AM', '08:00 PM'],
        instructions: 'Take immediately after morning and evening meals',
        takenToday: false,
        refillDate: '2026-10-05',
        createdAt: new Date().toISOString(),
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'Calcium & Vitamin D3',
        dosage: '500mg / 400IU',
        frequency: 'Once daily',
        times: ['01:30 PM'],
        instructions: 'Take after lunch',
        takenToday: false,
        refillDate: '2026-11-01',
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  const bills = new Map<number, BillRecord>([
    [
      1,
      {
        id: 1,
        title: 'City Electricity Utility Bill',
        vendor: 'Pacific Power & Light',
        amount: 84.5,
        dueDate: `${todayStr}`,
        isPaid: false,
        category: 'utility',
        notes: 'Monthly power consumption. Late fee applies after due date.',
        invoiceNumber: 'ELEC-984210',
        confidenceScore: 0.98,
        createdAt: new Date().toISOString(),
      },
      ],
      [
      2,
      {
        id: 2,
        title: 'Dr. Sharma Consultation Receipt',
        vendor: 'City Heart Clinic',
        amount: 45.0,
        dueDate: todayStr,
        isPaid: true,
        category: 'medical',
        notes: 'Routine consultation paid via card',
        invoiceNumber: 'MED-5512',
        confidenceScore: 0.99,
        createdAt: new Date().toISOString(),
      },
    ],
  ]);

  const emergencyContacts = new Map<number, EmergencyContact>([
    [
      1,
      {
        id: 1,
        name: 'Sarah (Daughter)',
        relation: 'Primary Caregiver',
        phone: '+1 (555) 234-5678',
        isPrimary: true,
      },
    ],
    [
      2,
      {
        id: 2,
        name: 'Dr. Sharma (Physician)',
        relation: 'Family Doctor',
        phone: '+1 (555) 987-6543',
        isPrimary: false,
      },
    ],
    [
      3,
      {
        id: 3,
        name: 'Local Emergency Hotline',
        relation: 'Medical & Police',
        phone: '911',
        isPrimary: false,
      },
    ],
  ]);

  return {
    reminders,
    tasks,
    appointments,
    medications,
    bills,
    emergencyContacts,
    nextId: {
      reminders: 10,
      tasks: 10,
      appointments: 10,
      medications: 10,
      bills: 10,
      emergencyContacts: 10,
    },
  };
}

const store: DatabaseStore = globalForDb.__seniorBuddyStore || (globalForDb.__seniorBuddyStore = initStore());

// ================= Reminders =================
export function createReminder(title: string, description: string | undefined, dueDate: string): Reminder {
  const id = store.nextId.reminders++;
  const reminder: Reminder = {
    id,
    title,
    description,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  store.reminders.set(id, reminder);
  return reminder;
}

export function getReminderById(id: number): Reminder | undefined {
  return store.reminders.get(id);
}

export function getAllReminders(): Reminder[] {
  return Array.from(store.reminders.values()).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function getActiveReminders(): Reminder[] {
  return getAllReminders().filter((r) => !r.completed);
}

export function updateReminder(id: number, updates: Partial<Reminder>): Reminder | undefined {
  const reminder = store.reminders.get(id);
  if (!reminder) return undefined;
  const updated: Reminder = {
    ...reminder,
    ...updates,
    id, // protect id
  };
  store.reminders.set(id, updated);
  return updated;
}

export function deleteReminder(id: number): boolean {
  return store.reminders.delete(id);
}

// ================= Tasks =================
export function createTask(title: string, description: string | undefined, dueDate: string | undefined): Task {
  const id = store.nextId.tasks++;
  const task: Task = {
    id,
    title,
    description,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  store.tasks.set(id, task);
  return task;
}

export function getTaskById(id: number): Task | undefined {
  return store.tasks.get(id);
}

export function getAllTasks(): Task[] {
  return Array.from(store.tasks.values()).sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function getActiveTasks(): Task[] {
  return getAllTasks().filter((t) => !t.completed);
}

export function updateTask(id: number, updates: Partial<Task>): Task | undefined {
  const task = store.tasks.get(id);
  if (!task) return undefined;
  const updated: Task = {
    ...task,
    ...updates,
    id,
  };
  store.tasks.set(id, updated);
  return updated;
}

export function deleteTask(id: number): boolean {
  return store.tasks.delete(id);
}

// ================= Appointments =================
export function createAppointment(
  title: string,
  description: string | undefined,
  date: string,
  time: string | undefined,
  location: string | undefined
): Appointment {
  const id = store.nextId.appointments++;
  const appointment: Appointment = {
    id,
    title,
    description,
    date,
    time,
    location,
    createdAt: new Date().toISOString(),
  };
  store.appointments.set(id, appointment);
  return appointment;
}

export function getAppointmentById(id: number): Appointment | undefined {
  return store.appointments.get(id);
}

export function getAllAppointments(): Appointment[] {
  return Array.from(store.appointments.values()).sort(
    (a, b) => new Date(`${a.date} ${a.time || ''}`).getTime() - new Date(`${b.date} ${b.time || ''}`).getTime()
  );
}

export function updateAppointment(id: number, updates: Partial<Appointment>): Appointment | undefined {
  const appointment = store.appointments.get(id);
  if (!appointment) return undefined;
  const updated: Appointment = {
    ...appointment,
    ...updates,
    id,
  };
  store.appointments.set(id, updated);
  return updated;
}

export function deleteAppointment(id: number): boolean {
  return store.appointments.delete(id);
}

// ================= Medications =================
export function createMedication(
  name: string,
  dosage: string,
  frequency: string,
  times: string[],
  instructions?: string,
  refillDate?: string
): Medication {
  const id = store.nextId.medications++;
  const medication: Medication = {
    id,
    name,
    dosage,
    frequency,
    times,
    instructions,
    takenToday: false,
    refillDate,
    createdAt: new Date().toISOString(),
  };
  store.medications.set(id, medication);
  return medication;
}

export function getAllMedications(): Medication[] {
  return Array.from(store.medications.values());
}

export function getMedicationById(id: number): Medication | undefined {
  return store.medications.get(id);
}

export function updateMedication(id: number, updates: Partial<Medication>): Medication | undefined {
  const med = store.medications.get(id);
  if (!med) return undefined;
  const updated: Medication = {
    ...med,
    ...updates,
    id,
  };
  store.medications.set(id, updated);
  return updated;
}

export function toggleMedicationTaken(id: number): Medication | undefined {
  const med = store.medications.get(id);
  if (!med) return undefined;
  med.takenToday = !med.takenToday;
  store.medications.set(id, med);
  return med;
}

export function deleteMedication(id: number): boolean {
  return store.medications.delete(id);
}

// ================= Bills =================
export function createBill(
  title: string,
  vendor: string,
  amount: number,
  dueDate: string,
  isPaid: boolean = false,
  category: BillRecord['category'] = 'utility',
  notes?: string,
  invoiceNumber?: string,
  confidenceScore?: number
): BillRecord {
  const id = store.nextId.bills++;
  const bill: BillRecord = {
    id,
    title,
    vendor,
    amount,
    dueDate,
    isPaid,
    category,
    notes,
    invoiceNumber,
    confidenceScore,
    createdAt: new Date().toISOString(),
  };
  store.bills.set(id, bill);
  return bill;
}

export function getAllBills(): BillRecord[] {
  return Array.from(store.bills.values()).sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function getBillById(id: number): BillRecord | undefined {
  return store.bills.get(id);
}

export function updateBill(id: number, updates: Partial<BillRecord>): BillRecord | undefined {
  const bill = store.bills.get(id);
  if (!bill) return undefined;
  const updated: BillRecord = {
    ...bill,
    ...updates,
    id,
  };
  store.bills.set(id, updated);
  return updated;
}

export function deleteBill(id: number): boolean {
  return store.bills.delete(id);
}

// ================= Emergency Contacts =================
export function getEmergencyContacts(): EmergencyContact[] {
  return Array.from(store.emergencyContacts.values());
}

export function addEmergencyContact(name: string, relation: string, phone: string, isPrimary: boolean = false): EmergencyContact {
  const id = store.nextId.emergencyContacts++;
  const contact: EmergencyContact = {
    id,
    name,
    relation,
    phone,
    isPrimary,
  };
  store.emergencyContacts.set(id, contact);
  return contact;
}

// ================= My Day =================
export function getMyDay(): MyDay {
  const allReminders = getAllReminders();
  const allTasks = getAllTasks();
  const allAppointments = getAllAppointments();
  const allMedications = getAllMedications();

  return {
    reminders: allReminders,
    tasks: allTasks,
    appointments: allAppointments,
    medications: allMedications,
  };
}

export default store;