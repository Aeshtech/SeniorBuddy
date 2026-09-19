'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SpeechSpeaker from '@/components/SpeechSpeaker';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

interface Appointment {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions?: string;
  takenToday: boolean;
}

interface MyDayData {
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
  medications: Medication[];
}

export default function MyDayPage() {
  const [myDay, setMyDay] = useState<MyDayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchMyDay = async () => {
    try {
      const response = await fetch('/api/my-day');
      const data = await response.json();
      setMyDay(data);
    } catch (error) {
      console.error('Failed to fetch my day:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDay();
  }, []);

  const toggleReminder = async (id: number, currentCompleted: boolean) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      fetchMyDay();
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const deleteReminder = async (id: number) => {
    if (!confirm('Are you sure you want to remove this reminder?')) return;
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });
      fetchMyDay();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleToggleMed = async (id: number) => {
    try {
      await fetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleTaken: true }),
      });
      fetchMyDay();
    } catch (error) {
      console.error('Failed to toggle medication:', error);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          dueDate: newDate || new Date().toISOString().split('T')[0],
          description: newDesc.trim() || undefined,
        }),
      });

      if (res.ok) {
        setShowAddReminder(false);
        setNewTitle('');
        setNewDate('');
        setNewDesc('');
        fetchMyDay();
      }
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fullDaySummary = myDay
    ? `Today's schedule: You have ${myDay.medications?.length || 0} medications, ${
        myDay.appointments?.length || 0
      } doctor appointments, and ${myDay.reminders?.length || 0} reminders.`
    : 'Your day schedule is being loaded.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-amber-50 rounded-3xl p-6 sm:p-10 border-2 border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-4xl shadow-md">
            📅
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              My Day & Daily Planner
            </h1>
            <p className="text-stone-600 text-lg font-medium">
              Your clear, large-print daily checklist of pills, doctor visits, and routines.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SpeechSpeaker text={fullDaySummary} label="Read Schedule" size="md" />
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white hover:bg-stone-100 text-stone-800 font-bold px-4 py-2.5 rounded-xl border border-stone-300 shadow-xs text-base cursor-pointer flex items-center gap-2"
            title="Print a copy for your refrigerator or bedside table"
          >
            <span>🖨️</span>
            <span>Print Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddReminder(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black px-5 py-2.5 rounded-xl shadow-md text-base cursor-pointer"
          >
            + Add Reminder
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-stone-500 text-xl font-medium">
          Organizing your schedule...
        </p>
      ) : (
        <div className="space-y-8">
          {/* Medications Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                <span>💊</span> Today's Pill & Medicine Schedule
              </h2>
              <Link
                href="/medications"
                className="text-base font-bold text-emerald-700 hover:underline no-underline"
              >
                Manage Pill Box ➔
              </Link>
            </div>

            {myDay?.medications && myDay.medications.length > 0 ? (
              <div className="space-y-3">
                {myDay.medications.map((med) => (
                  <div
                    key={med.id}
                    className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      med.takenToday
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-white border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleMed(med.id)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-all ${
                          med.takenToday
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-stone-400 bg-white hover:border-emerald-500 text-transparent'
                        }`}
                        title={med.takenToday ? 'Mark as untaken' : 'Mark as taken'}
                      >
                        ✓
                      </button>
                      <div>
                        <h3
                          className={`text-xl font-black ${
                            med.takenToday ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {med.name} — {med.dosage}
                        </h3>
                        <p className="text-sm text-stone-600">
                          {med.frequency} · Scheduled for {med.times.join(', ')}
                        </p>
                        {med.instructions && (
                          <p className="text-xs text-amber-800 font-medium mt-1">
                            Note: {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        med.takenToday
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-amber-200 text-amber-950'
                      }`}
                    >
                      {med.takenToday ? 'Taken' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 py-3">No medications scheduled for today.</p>
            )}
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
              <span>🩺</span> Doctor Appointments & Visits
            </h2>

            {myDay?.appointments && myDay.appointments.length > 0 ? (
              <div className="space-y-4">
                {myDay.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-6 rounded-2xl bg-sky-50 border-2 border-sky-300 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h3 className="text-2xl font-black text-sky-950">{apt.title}</h3>
                      <span className="text-sm font-black uppercase bg-sky-200 text-sky-900 px-3 py-1 rounded-full">
                        {apt.time || 'All Day'}
                      </span>
                    </div>

                    {apt.location && (
                      <p className="text-base text-stone-700 font-bold flex items-center gap-2">
                        <span>📍 Location:</span>
                        <span>{apt.location}</span>
                      </p>
                    )}

                    {apt.description && (
                      <p className="text-sm text-stone-600 bg-white/70 p-3 rounded-xl">
                        💡 {apt.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 py-3">No doctor appointments on your calendar today.</p>
            )}
          </div>

          {/* Reminders & Routines Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
                <span>⏰</span> Daily Reminders & Routines
              </h2>
              <button
                type="button"
                onClick={() => setShowAddReminder(true)}
                className="text-base font-bold text-amber-700 hover:underline cursor-pointer"
              >
                + New Reminder
              </button>
            </div>

            {myDay?.reminders && myDay.reminders.length > 0 ? (
              <div className="space-y-3">
                {myDay.reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      rem.completed ? 'bg-stone-100 border-stone-300' : 'bg-white border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => toggleReminder(rem.id, rem.completed)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all ${
                          rem.completed
                            ? 'bg-amber-600 text-white'
                            : 'border-2 border-stone-400 bg-white hover:border-amber-500 text-transparent'
                        }`}
                        title={rem.completed ? 'Mark as incomplete' : 'Mark as done'}
                      >
                        ✓
                      </button>
                      <div>
                        <h3
                          className={`text-xl font-black ${
                            rem.completed ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {rem.title}
                        </h3>
                        {rem.description && (
                          <p className="text-sm text-stone-600 mt-0.5">{rem.description}</p>
                        )}
                        <p className="text-xs text-stone-500 mt-1">Due: {rem.dueDate}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteReminder(rem.id)}
                      className="text-stone-400 hover:text-red-600 p-2 rounded-xl text-lg font-bold cursor-pointer"
                      title="Delete reminder"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 py-3">All reminders completed for today!</p>
            )}
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <h2 className="text-2xl font-black text-stone-900">Add Reminder</h2>
              <button
                type="button"
                onClick={() => setShowAddReminder(false)}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  What to remind about *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call grandson, Take morning walk"
                  required
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  Helpful Notes
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Bring umbrella if cloudy"
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReminder(false)}
                  className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-lg shadow-md cursor-pointer"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}