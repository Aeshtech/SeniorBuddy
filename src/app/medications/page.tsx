'use client';

import { useState, useEffect } from 'react';
import SpeechSpeaker from '@/components/SpeechSpeaker';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions?: string;
  takenToday: boolean;
  refillDate?: string;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('Once daily');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRefillDate, setNewRefillDate] = useState('');

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/medications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedications(data);
      }
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleToggleTaken = async (id: number) => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleTaken: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMedications((prev) => prev.map((m) => (m.id === id ? updated : m)));
      }
    } catch (err) {
      console.error('Error toggling medication:', err);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDosage.trim()) return;

    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          dosage: newDosage.trim(),
          frequency: newFrequency,
          times: [newTime],
          instructions: newInstructions.trim() || undefined,
          refillDate: newRefillDate || undefined,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setMedications((prev) => [...prev, created]);
        setShowAddModal(false);
        setNewName('');
        setNewDosage('');
        setNewInstructions('');
        setNewRefillDate('');
      }
    } catch (err) {
      console.error('Error adding medication:', err);
    }
  };

  const handleDeleteMedication = async (id: number) => {
    if (!confirm('Are you sure you want to remove this medication from your list?')) return;
    try {
      const res = await fetch(`/api/medications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedications((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  const takenCount = medications.filter((m) => m.takenToday).length;
  const pendingCount = medications.length - takenCount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-emerald-50 rounded-3xl p-6 sm:p-10 border-2 border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-4xl shadow-md">
            💊
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              Daily Pill & Medication Tracker
            </h1>
            <p className="text-stone-600 text-lg font-medium">
              Keep your medicine routine on schedule with simple checkboxes and spoken reminders.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg px-6 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>+ Add Medication</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-stone-200 shadow-sm text-center">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Prescribed</p>
          <p className="text-4xl font-black text-stone-900 mt-2">{medications.length}</p>
          <p className="text-sm text-stone-600 mt-1">Daily medicines</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 shadow-sm text-center">
          <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Taken Today</p>
          <p className="text-4xl font-black text-emerald-700 mt-2">{takenCount}</p>
          <p className="text-sm text-emerald-800 mt-1">Great job!</p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-sm text-center">
          <p className="text-sm font-bold text-amber-800 uppercase tracking-wider">Remaining</p>
          <p className="text-4xl font-black text-amber-700 mt-2">{pendingCount}</p>
          <p className="text-sm text-amber-800 mt-1">Waiting to be taken</p>
        </div>
      </div>

      {/* Medication List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900">Your Medications</h2>
          <SpeechSpeaker
            text={`You have ${medications.length} total medications. ${pendingCount} are still remaining for today.`}
            label="Read Summary"
          />
        </div>

        {loading ? (
          <p className="text-center py-10 text-stone-500 text-lg">Loading medications...</p>
        ) : medications.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300">
            <p className="text-2xl font-bold text-stone-700">No medications logged yet</p>
            <p className="text-stone-500 mt-2 mb-4">Tap &quot;+ Add Medication&quot; above to log your pills</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl cursor-pointer"
            >
              Add First Medicine
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => {
              const medSpeech = `${med.name}, dosage ${med.dosage}. Frequency: ${med.frequency}. Scheduled for ${med.times.join(' and ')}. Instructions: ${med.instructions || 'take as prescribed'}. Currently ${med.takenToday ? 'taken' : 'not yet taken'}.`;

              return (
                <div
                  key={med.id}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                    med.takenToday
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTaken(med.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black transition-all cursor-pointer shrink-0 ${
                        med.takenToday
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'border-3 border-stone-400 bg-white hover:border-emerald-600 text-transparent'
                      }`}
                      title={med.takenToday ? 'Click to mark as NOT taken' : 'Click to mark as TAKEN'}
                    >
                      ✓
                    </button>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-2xl font-black ${
                            med.takenToday ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {med.name}
                        </h3>
                        <span
                          className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                            med.takenToday
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-200 text-amber-950'
                          }`}
                        >
                          {med.takenToday ? 'Taken Today' : 'Due Today'}
                        </span>
                      </div>

                      <p className="text-base text-stone-700 font-semibold mt-1">
                        Dosage: <span className="text-stone-900">{med.dosage}</span> · Timing:{' '}
                        <span className="text-emerald-800">{med.times.join(', ')}</span> ({med.frequency})
                      </p>

                      {med.instructions && (
                        <p className="text-sm text-stone-600 mt-1 bg-stone-100 px-3 py-1 rounded-lg inline-block">
                          💡 {med.instructions}
                        </p>
                      )}

                      {med.refillDate && (
                        <p className="text-xs text-amber-800 font-bold mt-1">
                          📅 Prescription Refill Due: {med.refillDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <SpeechSpeaker text={medSpeech} size="sm" label="Read" />
                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="text-stone-400 hover:text-red-600 p-2 rounded-xl text-lg font-bold transition-colors cursor-pointer"
                      title="Remove medication"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
              <h2 className="text-2xl font-black text-stone-900">Add New Medication</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lisinopril, Metformin, Multivitamin"
                  required
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-stone-800 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 10 mg, 1 tablet"
                    required
                    className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-stone-800 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  Frequency
                </label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="Once daily">Once daily (Morning or Night)</option>
                  <option value="Twice daily">Twice daily (Morning & Evening)</option>
                  <option value="Three times daily">Three times daily (With meals)</option>
                  <option value="As needed">As needed (Pain or relief)</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Take with warm water after eating"
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-stone-800 mb-1">
                  Prescription Refill Date (Optional)
                </label>
                <input
                  type="date"
                  value={newRefillDate}
                  onChange={(e) => setNewRefillDate(e.target.value)}
                  className="w-full text-lg p-3.5 rounded-xl border-2 border-stone-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg shadow-md cursor-pointer"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
