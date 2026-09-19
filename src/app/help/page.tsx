'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-800">🤝 Help</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            How Can I Help You?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Here are some things I can help you with:
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl">🔍</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Understand Messages</h3>
                <p className="text-lg text-gray-600">
                  Show me any message, email, or notice and I'll explain what it means in simple terms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl">
              <div className="text-4xl">📅</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Create Reminders</h3>
                <p className="text-lg text-gray-600">
                  Tell me what you need to remember and when, and I'll create a reminder for you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl">💳</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Manage Bills</h3>
                <p className="text-lg text-gray-600">
                  I can help you understand bills, due dates, and set up payment reminders.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-red-50 rounded-xl">
              <div className="text-4xl">🛡️</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Stay Safe Online</h3>
                <p className="text-lg text-gray-600">
                  Show me suspicious messages and I'll help identify warning signs and keep you safe.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-yellow-50 rounded-xl">
              <div className="text-4xl">📅</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Plan Your Day</h3>
                <p className="text-lg text-gray-600">
                  I can help you organize your tasks, appointments, and important dates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-indigo-50 rounded-xl">
              <div className="text-4xl">💬</div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">General Questions</h3>
                <p className="text-lg text-gray-600">
                  Just ask me anything! I'm here to help make technology easier for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white mb-6">
          <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-2xl">1️⃣</div>
              <p className="text-xl">Go to the home page and choose what you need help with</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">2️⃣</div>
              <p className="text-xl">Talk to the AI assistant - just like having a conversation</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">3️⃣</div>
              <p className="text-xl">Check "My Day" to see your reminders and appointments</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">4️⃣</div>
              <p className="text-xl">Use the Safety page if you receive suspicious messages</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Need More Help?</h3>
          <p className="text-xl text-gray-600 mb-6">
            If you need additional assistance, please contact your family member or caregiver who set up this app for you.
          </p>
          <Link 
            href="/assistant" 
            className="inline-block bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-600 transition-colors"
          >
            Talk to Assistant
          </Link>
        </div>
      </main>
    </div>
  );
}