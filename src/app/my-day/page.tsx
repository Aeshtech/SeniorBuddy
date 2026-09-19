'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface MyDayData {
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
}

export default function MyDayPage() {
  const [myDay, setMyDay] = useState<MyDayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDay();
  }, []);

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

  const toggleReminder = async (id: number, completed: boolean) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      fetchMyDay();
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      });
      fetchMyDay();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading your day...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-800">My Day</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Today's Overview
          </h2>
          
          {!myDay || (myDay.reminders.length === 0 && myDay.tasks.length === 0 && myDay.appointments.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600 mb-4">You have no upcoming items!</p>
              <Link 
                href="/assistant" 
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-blue-600 transition-colors"
              >
                Ask Assistant to Add Items
              </Link>
            </div>
          ) : (
            <>
              {/* Reminders Section */}
              {myDay.reminders.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    🔔 Reminders
                  </h3>
                  <div className="space-y-4">
                    {myDay.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          reminder.completed
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-xl font-bold ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {reminder.title}
                            </h4>
                            {reminder.description && (
                              <p className="text-lg text-gray-600 mt-2">{reminder.description}</p>
                            )}
                            <p className="text-lg text-gray-500 mt-2">
                              Due: {new Date(reminder.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleReminder(reminder.id, reminder.completed)}
                              className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                              title={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {reminder.completed ? '↩️' : '✓'}
                            </button>
                            <button
                              onClick={() => deleteReminder(reminder.id)}
                              className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              {myDay.tasks.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    📋 Tasks
                  </h3>
                  <div className="space-y-4">
                    {myDay.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          task.completed
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-purple-50 border-purple-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-xl font-bold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-lg text-gray-600 mt-2">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-lg text-gray-500 mt-2">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleReminder(task.id, task.completed)}
                              className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                              title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {task.completed ? '↩️' : '✓'}
                            </button>
                            <button
                              onClick={() => deleteReminder(task.id)}
                              className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Section */}
              {myDay.appointments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    📅 Appointments
                  </h3>
                  <div className="space-y-4">
                    {myDay.appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-6 rounded-xl border-2 bg-green-50 border-green-200"
                      >
                        <h4 className="text-xl font-bold text-gray-800">{appointment.title}</h4>
                        {appointment.description && (
                          <p className="text-lg text-gray-600 mt-2">{appointment.description}</p>
                        )}
                        <div className="mt-3 space-y-1">
                          <p className="text-lg text-gray-600">
                            📆 {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          {appointment.time && (
                            <p className="text-lg text-gray-600">
                              ⏰ {appointment.time}
                            </p>
                          )}
                          {appointment.location && (
                            <p className="text-lg text-gray-600">
                              📍 {appointment.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add New Item */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Need to add something?</h3>
          <p className="text-xl mb-6">Ask your AI assistant to create reminders or add tasks</p>
          <Link 
            href="/assistant" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Talk to Assistant
          </Link>
        </div>
      </main>
    </div>
  );
}