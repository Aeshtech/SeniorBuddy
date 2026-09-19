'use client';

import Link from 'next/link';
import SpeechSpeaker from '@/components/SpeechSpeaker';

export default function HelpPage() {
  const emergencyContacts = [
    {
      name: 'Emergency Medical & Police',
      relation: 'Emergency Services (911)',
      phone: 'tel:911',
      numberDisplay: '911',
      icon: '🚑',
      btnColor: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Sarah (Daughter)',
      relation: 'Primary Caregiver & Family Contact',
      phone: 'tel:+15552345678',
      numberDisplay: '(555) 234-5678',
      icon: '👩',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      name: 'Dr. Sharma (Primary Care Clinic)',
      relation: 'Family Physician & Appointments',
      phone: 'tel:+15559876543',
      numberDisplay: '(555) 987-6543',
      icon: '🩺',
      btnColor: 'bg-sky-600 hover:bg-sky-700',
    },
    {
      name: 'Walgreen’s Pharmacy Refill Desk',
      relation: 'Medication Refills & Delivery',
      phone: 'tel:+15554567890',
      numberDisplay: '(555) 456-7890',
      icon: '💊',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  const faqs = [
    {
      q: 'How do I take a photo of a bill or letter?',
      a: 'Go to "Scan Bills & Mail" in the top menu and tap the camera button. Point your phone or tablet camera at the paper so all words and numbers are visible. SeniorBuddy will read it and tell you the amount due in large numbers.',
    },
    {
      q: 'Can I speak instead of typing?',
      a: 'Yes! On the "AI Companion" page, tap the microphone button 🎙️ and speak into your device. SeniorBuddy will automatically listen and write your words.',
    },
    {
      q: 'How do I mark my medicine pills as taken?',
      a: 'Go to "Pill Tracker" or the Home page. Beside each pill name, tap the circle checkbox. When it turns green with a checkmark ✓, you know you have taken it for the day.',
    },
    {
      q: 'What should I do if a caller threatens me with arrest or demand gift cards?',
      a: 'Hang up the phone immediately! This is always a criminal scam. No government agency or court ever accepts gift cards or demands urgent wire transfers.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-amber-50 rounded-3xl p-6 sm:p-10 border-2 border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-4xl shadow-md">
            📞
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              Help, Contacts & Simple Guide
            </h1>
            <p className="text-stone-600 text-lg font-medium">
              One-tap calling for family and doctors, plus answers to common questions.
            </p>
          </div>
        </div>

        <SpeechSpeaker
          text="Welcome to Help and Contacts. Here you can call your daughter Sarah, Dr. Sharma, or 911 with a single tap. You can also read simple guides on how to use SeniorBuddy."
          label="Listen to Page"
          size="md"
        />
      </div>

      {/* Emergency & Family Contacts Directory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
              <span>🚨</span> One-Tap Speed Dial Contacts
            </h2>
            <p className="text-stone-600 text-sm">
              Tap any green or red phone button to call instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border-2 border-stone-200 hover:border-amber-300 transition-all bg-stone-50/60 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{contact.icon}</span>
                <div>
                  <h3 className="text-xl font-black text-stone-900">{contact.name}</h3>
                  <p className="text-xs text-stone-600 font-medium">{contact.relation}</p>
                  <p className="text-sm font-bold text-stone-800 mt-1">{contact.numberDisplay}</p>
                </div>
              </div>

              <a
                href={contact.phone}
                className={`px-5 py-3 rounded-xl text-white font-black text-base shadow-sm no-underline transition-all transform active:scale-95 ${contact.btnColor}`}
              >
                CALL NOW
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-stone-900 flex items-center gap-3">
          <span>💡</span> Simple Guide & Common Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-stone-900">{faq.q}</h3>
                <SpeechSpeaker text={faq.a} size="sm" label="Read Answer" />
              </div>
              <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Need More Help Banner */}
      <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-3xl p-8 sm:p-10 text-stone-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Still Have Questions?</h3>
          <p className="text-amber-100 text-lg font-medium mt-1">
            Talk directly to your AI companion. Ask anything you want!
          </p>
        </div>
        <Link
          href="/assistant"
          className="bg-white hover:bg-stone-100 text-stone-900 font-black text-lg px-8 py-4 rounded-2xl shadow-md no-underline transition-all shrink-0"
        >
          Open AI Companion ➔
        </Link>
      </div>
    </div>
  );
}