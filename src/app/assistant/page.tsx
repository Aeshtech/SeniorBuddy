"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
    image?: string;
}

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.message,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (action: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.message,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error with quick action:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedImage);
            formData.append("context", input || "Please analyze this image");

            const response = await fetch("/api/analyze-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            const userMessage: Message = {
                role: "user",
                content: input || "Uploaded an image for analysis",
                image: imagePreview,
            };

            const assistantMessage: Message = {
                role: "assistant",
                content:
                    data.analysis || "Sorry, I could not analyze the image.",
            };

            setMessages((prev) => [...prev, userMessage, assistantMessage]);
            setSelectedImage(null);
            setImagePreview(null);
            setInput("");
        } catch (error) {
            console.error("Error uploading image:", error);
            const errorMessage: Message = {
                role: "assistant",
                content:
                    "Sorry, I encountered an error analyzing the image. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-blue-600"
                        >
                            ← Back
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            AI Assistant
                        </h1>
                        <div className="w-20" />
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Quick Actions */}
                {messages.length === 0 && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                            What would you like help with?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleQuickAction("bills")}
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">💳</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Bills
                                </h3>
                                <p className="text-gray-600">
                                    Understand and manage your bills
                                </p>
                            </button>

                            <button
                                onClick={() => handleQuickAction("messages")}
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">📱</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Messages
                                </h3>
                                <p className="text-gray-600">
                                    Check if messages are safe
                                </p>
                            </button>

                            <button
                                onClick={() => handleQuickAction("documents")}
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">📄</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Documents
                                </h3>
                                <p className="text-gray-600">
                                    Understand important papers
                                </p>
                            </button>

                            <button
                                onClick={() =>
                                    handleQuickAction("appointments")
                                }
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">📅</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Appointments
                                </h3>
                                <p className="text-gray-600">
                                    Manage your schedule
                                </p>
                            </button>

                            <button
                                onClick={() => handleQuickAction("safety")}
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">🛡️</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Online Safety
                                </h3>
                                <p className="text-gray-600">
                                    Stay safe online
                                </p>
                            </button>

                            <button
                                onClick={() =>
                                    handleQuickAction("general help")
                                }
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">💬</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Just Chat
                                </h3>
                                <p className="text-gray-600">Ask me anything</p>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-100 hover:border-blue-300 text-left disabled:opacity-50"
                            >
                                <div className="text-4xl mb-3">📷</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Upload Bill
                                </h3>
                                <p className="text-gray-600">
                                    Upload a bill or document image
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 min-h-[400px]">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 py-12">
                                <p className="text-xl">
                                    Start a conversation or choose a quick
                                    action above
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl ${
                                        message.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Uploaded image"
                                            className="max-w-full h-auto rounded-lg mb-3"
                                        />
                                    )}
                                    <p className="text-lg whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-4 rounded-2xl">
                                    <p className="text-lg text-gray-600">
                                        Thinking...
                                    </p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <p className="text-lg font-medium text-gray-800 mb-2">
                                    {selectedImage?.name}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleImageUpload}
                                        disabled={isLoading}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        Analyze Image
                                    </button>
                                    <button
                                        onClick={clearImage}
                                        disabled={isLoading}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="flex gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="bg-gray-200 text-gray-700 px-6 py-4 rounded-xl text-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
                        title="Upload image"
                    >
                        📷
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your message here..."
                        disabled={isLoading}
                        className="flex-1 p-4 text-xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </main>
        </div>
    );
}
