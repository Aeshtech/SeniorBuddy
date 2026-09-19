"use client";

import { useState } from "react";
import Link from "next/link";

export default function SafetyPage() {
    const [message, setMessage] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const analyzeMessage = async () => {
        if (!message.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "safety",
                    context: message,
                }),
            });

            const data = await response.json();
            setAnalysis({
                message: message,
                result: data.message,
                warningSigns: extractWarningSigns(data.message),
                recommendation: extractRecommendation(data.message),
            });
        } catch (error) {
            console.error("Error analyzing message:", error);
            setAnalysis({
                message: message,
                result: "Sorry, I encountered an error analyzing the message. Please try again.",
                warningSigns: [],
                recommendation:
                    "Please try again or contact support if the issue persists.",
            });
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

    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedImage);
            formData.append(
                "context",
                "Analyze this image for safety concerns and warning signs",
            );

            const response = await fetch("/api/analyze-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            setAnalysis({
                message: "Uploaded image",
                result:
                    data.analysis || "Sorry, I could not analyze the image.",
                warningSigns: extractWarningSigns(data.analysis || ""),
                recommendation: extractRecommendation(data.analysis || ""),
                image: imagePreview,
            });
        } catch (error) {
            console.error("Error analyzing image:", error);
            setAnalysis({
                message: "Uploaded image",
                result: "Sorry, I encountered an error analyzing the image. Please try again.",
                warningSigns: [],
                recommendation:
                    "Please try again or contact support if the issue persists.",
                image: imagePreview,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const extractWarningSigns = (result: string): string[] => {
        // This is a simple extraction - in production, the AI would structure this better
        const signs: string[] = [];
        const lowerResult = result.toLowerCase();

        if (
            lowerResult.includes("urgent") ||
            lowerResult.includes("immediate")
        ) {
            signs.push("Creates urgency or pressure");
        }
        if (
            lowerResult.includes("money") ||
            lowerResult.includes("payment") ||
            lowerResult.includes("account")
        ) {
            signs.push("Requests money or account access");
        }
        if (
            lowerResult.includes("password") ||
            lowerResult.includes("social security") ||
            lowerResult.includes("personal")
        ) {
            signs.push("Asks for personal information");
        }
        if (
            lowerResult.includes("click") ||
            lowerResult.includes("link") ||
            lowerResult.includes("download")
        ) {
            signs.push("Contains suspicious links or downloads");
        }
        if (
            lowerResult.includes("prize") ||
            lowerResult.includes("winner") ||
            lowerResult.includes("congratulations")
        ) {
            signs.push("Promises prizes or rewards");
        }

        return signs.length > 0 ? signs : ["No obvious warning signs detected"];
    };

    const extractRecommendation = (result: string): string => {
        const lowerResult = result.toLowerCase();

        if (
            lowerResult.includes("safe") ||
            lowerResult.includes("legitimate")
        ) {
            return "This message appears to be safe. However, always verify with the sender through a different channel if you're unsure.";
        }

        if (
            lowerResult.includes("suspicious") ||
            lowerResult.includes("scam") ||
            lowerResult.includes("dangerous")
        ) {
            return "Do not respond, click any links, or provide any information. Contact the organization directly through their official website or phone number to verify.";
        }

        return "Please be cautious. Verify the sender's identity through a different channel before taking any action.";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
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
                            🛡️ Safety Check
                        </h1>
                        <div className="w-20" />
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Is This Message Safe?
                    </h2>
                    <p className="text-xl text-gray-600 mb-6">
                        Paste any message you're unsure about, and I'll help you
                        identify warning signs and stay safe.
                    </p>

                    {/* Message Input */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Paste the message here:
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Paste the suspicious message here..."
                            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none min-h-[200px]"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Or upload an image:
                        </label>
                        <input
                            type="file"
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mb-6">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full h-auto rounded-lg border-2 border-gray-300"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={analyzeImage}
                                    disabled={isLoading}
                                    className="bg-red-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Analyze Image
                                </button>
                                <button
                                    onClick={clearImage}
                                    disabled={isLoading}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={analyzeMessage}
                        disabled={isLoading || !message.trim()}
                        className="w-full bg-red-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Analyzing..." : "Check Message Safety"}
                    </button>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            Analysis Results
                        </h3>

                        {/* Original Message */}
                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                Original Message:
                            </h4>
                            {analysis.image && (
                                <img
                                    src={analysis.image}
                                    alt="Uploaded image"
                                    className="max-w-full h-auto rounded-lg mb-3"
                                />
                            )}
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {analysis.message}
                            </p>
                        </div>

                        {/* AI Analysis */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                What I Found:
                            </h4>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {analysis.result}
                            </p>
                        </div>

                        {/* Warning Signs */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">
                                Warning Signs:
                            </h4>
                            <div className="space-y-2">
                                {analysis.warningSigns.map(
                                    (sign: string, index: number) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg ${
                                                sign ===
                                                "No obvious warning signs detected"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }`}
                                        >
                                            <p className="text-lg">⚠️ {sign}</p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                Recommendation:
                            </h4>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {analysis.recommendation}
                            </p>
                        </div>
                    </div>
                )}

                {/* Safety Tips */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        General Safety Tips
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">🔒</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Never share passwords or personal
                                    information
                                </h4>
                                <p className="text-gray-600">
                                    Legitimate organizations will never ask for
                                    your password, Social Security number, or
                                    bank details via email or text.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-3xl">📞</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Verify through official channels
                                </h4>
                                <p className="text-gray-600">
                                    If you're unsure, contact the company
                                    directly using their official website or
                                    phone number (not the one in the message).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-3xl">🔗</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Be careful with links
                                </h4>
                                <p className="text-gray-600">
                                    Hover over links to see the actual URL. If
                                    it looks suspicious or doesn't match the
                                    company's official website, don't click.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-3xl">⏰</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    Watch for urgency
                                </h4>
                                <p className="text-gray-600">
                                    Scammers often create false urgency to make
                                    you act without thinking. Take your time and
                                    verify before responding.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="text-3xl">🎁</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    If it sounds too good to be true...
                                </h4>
                                <p className="text-gray-600">
                                    It probably is. Be skeptical of unexpected
                                    prizes, lottery winnings, or requests to
                                    help transfer money.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
