'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SpeechSpeaker from '@/components/SpeechSpeaker';

interface DayData {
  reminders: any[];
  tasks: any[];
  appointments: any[];
  medications: any[];
}

export default function Home() {
  const [greeting, setGreeting] = useState('Good morning');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceQuery, setVoiceQuery] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDateStr(new Date().toLocaleDateString(undefined, options));

    fetch('/api/my-day')
      .then((res) => res.json())
      .then((data) => {
        setDayData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load day data:', err);
        setLoading(false);
      });
  }, []);

  const handleToggleMed = async (id: number) => {
    try {
      const res = await fetch(`/api/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleTaken: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDayData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            medications: prev.medications.map((m) => (m.id === id ? updated : m)),
          };
        });
      }
    } catch (err) {
      console.error('Error toggling medication:', err);
    }
  };

  const handleToggleReminder = async (id: number, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDayData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            reminders: prev.reminders.map((r) => (r.id === id ? updated : r)),
          };
        });
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
    }
  };

  const pendingMeds = dayData?.medications?.filter((m) => !m.takenToday) || [];
  const takenMeds = dayData?.medications?.filter((m) => m.takenToday) || [];

  const spokenGreeting = `${greeting}! Today is ${currentDateStr}. ${
    pendingMeds.length > 0
      ? `You have ${pendingMeds.length} medications scheduled for today.`
      : 'All your medications for today are taken!'
  } ${
    dayData?.appointments && dayData.appointments.length > 0
      ? `You have an appointment with ${dayData.appointments[0].title}.`
      : ''
  }`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Welcome Hero Banner */}
      <section className="bg-linear-to-br from-amber-100/90 via-orange-50 to-amber-50 rounded-3xl p-6 sm:p-10 border-2 border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm uppercase tracking-wider font-extrabold text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full">
                {currentDateStr}
              </span>
              <SpeechSpeaker text={spokenGreeting} label="Hear Today's Overview" size="sm" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 mt-3 tracking-tight">
              {greeting}, Friend! 👋
            </h1>
            <p className="text-lg sm:text-2xl text-stone-700 font-medium mt-2 max-w-2xl">
              I'm SeniorBuddy. Everything you need to know and do today is arranged right here.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-amber-300 shadow-sm">
            <div className="text-4xl">🌤️</div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today's Outlook</p>
              <p className="text-xl font-bold text-stone-800">72°F · Clear & Pleasant</p>
              <p className="text-xs text-stone-600">Great for an afternoon walk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Voice / Question Ask Box */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2 flex items-center gap-3">
          <span className="text-3xl">🎙️</span> Ask SeniorBuddy Anything
        </h2>
        <p className="text-stone-600 text-base sm:text-lg mb-4">
          Type or ask questions like: &quot;Did I take my morning pill?&quot;, &quot;Is this text message safe?&quot;, or &quot;When is my doctor visit?&quot;
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (voiceQuery.trim()) {
              window.location.href = `/assistant?q=${encodeURIComponent(voiceQuery.trim())}`;
            }
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={voiceQuery}
            onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="Type your question in simple words..."
            className="flex-1 text-lg sm:text-xl px-5 py-4 rounded-2xl border-2 border-stone-300 focus:border-amber-500 focus:outline-hidden bg-stone-50 font-medium"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-lg px-8 py-4 rounded-2xl shadow-sm transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ask Now</span>
            <span className="text-xl">➔</span>
          </button>
        </form>
      </section>

      {/* Primary 4 Action Cards for Seniors */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/assistant"
          className="senior-card p-6 flex flex-col justify-between group no-underline"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-2">
              Talk to Companion
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              Have a conversation, ask for advice, or hear clear answers without jargon.
            </p>
          </div>
          <div className="mt-6 flex items-center text-amber-700 font-black text-base">
            <span>Start Chatting</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </Link>

        <Link
          href="/medications"
          className="senior-card p-6 flex flex-col justify-between group no-underline"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
              💊
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-2">
              Pill Tracker
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              {pendingMeds.length > 0
                ? `${pendingMeds.length} medication(s) waiting for today.`
                : 'All today’s medications have been taken!'}
            </p>
          </div>
          <div className="mt-6 flex items-center text-emerald-700 font-black text-base">
            <span>Open Pill Box</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </Link>

        <Link
          href="/bills"
          className="senior-card p-6 flex flex-col justify-between group no-underline"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
              📄
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-2">
              Scan Bills & Mail
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              Snap a photo of any letter or bill. AI reads the amount and tells you if you need to pay.
            </p>
          </div>
          <div className="mt-6 flex items-center text-sky-700 font-black text-base">
            <span>Scan Document</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </Link>

        <Link
          href="/safety"
          className="senior-card p-6 flex flex-col justify-between group no-underline"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-2">
              Scam Shield
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              Got a suspicious phone call, text, or prize notice? Let us check if it is safe.
            </p>
          </div>
          <div className="mt-6 flex items-center text-rose-700 font-black text-base">
            <span>Check Suspicious Msg</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </Link>
      </section>

      {/* Today's Schedule Overview */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Today's Schedule & Reminders
            </h2>
            <p className="text-stone-600 text-base sm:text-lg">
              Check off items as you complete them throughout the day.
            </p>
          </div>
          <Link
            href="/my-day"
            className="text-amber-700 hover:text-amber-800 font-bold text-base sm:text-lg flex items-center gap-1 no-underline"
          >
            <span>Full Schedule View</span>
            <span>➔</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-500 font-medium text-lg">
            Loading your day's schedule...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Medications Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <span>💊</span> Daily Medications ({dayData?.medications?.length || 0})
                </h3>
                <Link href="/medications" className="text-sm font-bold text-stone-500 hover:text-stone-800 no-underline">
                  Manage Pills
                </Link>
              </div>

              {dayData?.medications && dayData.medications.length > 0 ? (
                <div className="space-y-3">
                  {dayData.medications.map((med: any) => (
                    <div
                      key={med.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                        med.takenToday
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleMed(med.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold transition-all cursor-pointer ${
                            med.takenToday
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'border-2 border-stone-400 bg-white hover:border-emerald-500 text-transparent'
                          }`}
                          title={med.takenToday ? 'Mark as untaken' : 'Mark as taken'}
                        >
                          ✓
                        </button>
                        <div>
                          <p
                            className={`text-lg font-bold ${
                              med.takenToday ? 'line-through text-stone-500' : 'text-stone-900'
                            }`}
                          >
                            {med.name}
                          </p>
                          <p className="text-sm text-stone-600">
                            {med.dosage} · {med.frequency} · {med.times?.join(', ')}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-amber-800 font-medium mt-0.5">
                              Note: {med.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${
                          med.takenToday
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {med.takenToday ? 'Taken' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 py-4">No medications scheduled for today.</p>
              )}
            </div>

            {/* Appointments & Reminders Column */}
            <div className="space-y-6">
              {/* Doctor Appointments */}
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2 mb-3">
                  <span>🩺</span> Upcoming Appointments
                </h3>
                {dayData?.appointments && dayData.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {dayData.appointments.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-sky-950">{apt.title}</p>
                          <span className="text-xs font-bold uppercase bg-sky-200 text-sky-900 px-2.5 py-1 rounded-full">
                            {apt.time || 'All Day'}
                          </span>
                        </div>
                        <p className="text-sm text-stone-700 font-medium">
                          📍 {apt.location || 'Location not specified'}
                        </p>
                        {apt.description && (
                          <p className="text-xs text-stone-600 mt-1">
                            Note: {apt.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 py-2">No doctor visits scheduled for this week.</p>
                )}
              </div>

              {/* Reminders */}
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2 mb-3">
                  <span>⏰</span> Reminders
                </h3>
                {dayData?.reminders && dayData.reminders.length > 0 ? (
                  <div className="space-y-3">
                    {dayData.reminders.map((rem: any) => (
                      <div
                        key={rem.id}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                          rem.completed ? 'bg-stone-100 border-stone-300' : 'bg-white border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleReminder(rem.id, rem.completed)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer ${
                              rem.completed
                                ? 'bg-amber-600 text-white'
                                : 'border-2 border-stone-400 bg-white hover:border-amber-500 text-transparent'
                            }`}
                          >
                            ✓
                          </button>
                          <div>
                            <p
                              className={`text-base font-bold ${
                                rem.completed ? 'line-through text-stone-500' : 'text-stone-900'
                              }`}
                            >
                              {rem.title}
                            </p>
                            {rem.description && (
                              <p className="text-xs text-stone-600">{rem.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 py-2">No reminders for today.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
