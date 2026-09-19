"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
    const [greeting, setGreeting] = useState("");
    const [myDay, setMyDay] = useState<any>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        // Fetch today's data
        fetch("/api/my-day")
            .then((res) => res.json())
            .then((data) => setMyDay(data))
            .catch((err) => console.error("Failed to fetch my day:", err));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-blue-600">
                            SeniorBuddy
                        </h1>
                        <div className="flex gap-4">
                            <Link
                                href="/my-day"
                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                            >
                                📅 My Day
                            </Link>
                            <Link
                                href="/safety"
                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                            >
                                🛡️ Safety
                            </Link>
                            <Link
                                href="/help"
                                className="text-lg font-medium text-gray-700 hover:text-blue-600"
                            >
                                🤝 Help
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Greeting Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        {greeting} 👋
                    </h2>
                    <p className="text-2xl text-gray-600 mb-8">
                        How can I help you today?
                    </p>

                    {/* Main Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <Link
                            href="/assistant"
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300"
                        >
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Understand Something
                            </h3>
                            <p className="text-lg text-gray-600">
                                Get help understanding messages, bills, or
                                documents
                            </p>
                        </Link>

                        <Link
                            href="/bills"
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300"
                        >
                            <div className="text-5xl mb-4">💳</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Scan a Bill
                            </h3>
                            <p className="text-lg text-gray-600">
                                Upload a bill image for analysis
                            </p>
                        </Link>

                        <Link
                            href="/assistant"
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300"
                        >
                            <div className="text-5xl mb-4">📱</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Check a Message
                            </h3>
                            <p className="text-lg text-gray-600">
                                Check if a message is safe or suspicious
                            </p>
                        </Link>

                        <Link
                            href="/my-day"
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300"
                        >
                            <div className="text-5xl mb-4">📅</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Plan My Day
                            </h3>
                            <p className="text-lg text-gray-600">
                                See your reminders, tasks, and appointments
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Today's Attention */}
                {myDay &&
                    (myDay.reminders.length > 0 ||
                        myDay.appointments.length > 0) && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h3 className="text-3xl font-bold text-gray-800 mb-6">
                                Today's Attention
                            </h3>

                            {myDay.reminders.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xl font-semibold text-gray-700 mb-4">
                                        Reminders
                                    </h4>
                                    <div className="space-y-3">
                                        {myDay.reminders
                                            .slice(0, 3)
                                            .map((reminder: any) => (
                                                <div
                                                    key={reminder.id}
                                                    className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500"
                                                >
                                                    <p className="text-xl font-medium text-gray-800">
                                                        {reminder.title}
                                                    </p>
                                                    <p className="text-lg text-gray-600">
                                                        Due:{" "}
                                                        {new Date(
                                                            reminder.dueDate,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {myDay.appointments.length > 0 && (
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-700 mb-4">
                                        Appointments
                                    </h4>
                                    <div className="space-y-3">
                                        {myDay.appointments
                                            .slice(0, 3)
                                            .map((appointment: any) => (
                                                <div
                                                    key={appointment.id}
                                                    className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500"
                                                >
                                                    <p className="text-xl font-medium text-gray-800">
                                                        {appointment.title}
                                                    </p>
                                                    <p className="text-lg text-gray-600">
                                                        {new Date(
                                                            appointment.date,
                                                        ).toLocaleDateString()}
                                                        {appointment.time &&
                                                            ` · ${appointment.time}`}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {/* Quick AI Assistant */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                    <h3 className="text-3xl font-bold mb-4">
                        Need Help Right Now?
                    </h3>
                    <p className="text-xl mb-6">
                        Click below to talk with your AI assistant
                    </p>
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
