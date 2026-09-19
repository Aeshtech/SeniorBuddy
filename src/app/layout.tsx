import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SeniorBuddy - Your AI Daily Companion",
    description:
        "AI-powered assistant to help seniors understand information, manage tasks, and stay safe online.",
    viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <head>
                <meta
                    name="theme-color"
                    content="#3b82f6"
                />
            </head>
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
