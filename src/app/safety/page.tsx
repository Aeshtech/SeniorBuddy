'use client';

import { useState } from 'react';
import SpeechSpeaker from '@/components/SpeechSpeaker';

export default function SafetyPage() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const sampleScams = [
    {
      title: '🚨 Fake Bank Alert',
      text: 'URGENT: Your Wells Fargo account has been locked due to suspicious activity. Click here to verify your identity and restore access: http://bit.ly/secure-wf-login',
    },
    {
      title: '🎁 Fake Lottery / Prize',
      text: 'Congratulations! You have been selected as the 2nd prize winner of $250,000 in the Senior Sweepstakes. To claim your funds, please wire a $250 processing fee.',
    },
    {
      title: '👮 Fake IRS / Arrest Threat',
      text: 'This is Officer Davis from the IRS. An immediate warrant is issued for your arrest due to unpaid federal taxes. Call back now or buy $500 Apple gift cards to clear your record.',
    },
    {
      title: '👵 Grandchild Imposter',
      text: 'Grandma, it’s me! I am on a road trip with a friend and got into an accident. My phone is broken and I am in jail. Please don’t tell mom, just wire $1,200 to my public defender right away!',
    },
  ];

  const analyzeMessage = async (textToAnalyze?: string) => {
    const content = textToAnalyze || message;
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Please analyze this message to see if it is a scam targeting a senior citizen: "${content}". Tell me: 1. Is it a scam or safe? 2. What are the red flags? 3. Exactly what should I do (e.g. hang up, do not pay, verify)? Keep language simple and reassuring.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const rawText: string = data.message || '';

      const isScam =
        rawText.toLowerCase().includes('scam') ||
        rawText.toLowerCase().includes('fraud') ||
        rawText.toLowerCase().includes('warning') ||
        rawText.toLowerCase().includes('do not');

      setAnalysis({
        message: content,
        result: rawText,
        isScam,
      });
    } catch (error) {
      console.error('Error analyzing message:', error);
      setAnalysis({
        message: content,
        result:
          'I could not reach the checker service right now. As a safe rule of thumb: If someone is asking for money, gift cards, or your password, DO NOT give it to them!',
        isScam: true,
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
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append(
        'context',
        'Analyze this photo of a letter, screen text, or email. Check if it is a scam or phishing attempt targeting seniors.'
      );

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const summary = data.analysis || data.data?.summary || 'Image analyzed.';
      const isScam = Boolean(data.data?.isSuspicious);

      setAnalysis({
        message: 'Photo of letter / screen',
        result: summary,
        isScam,
        image: imagePreview,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-rose-50 rounded-3xl p-6 sm:p-10 border-2 border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-4xl shadow-md">
            🛡️
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              Scam & Fraud Shield
            </h1>
            <p className="text-stone-600 text-lg font-medium">
              Got a strange phone call, text, or email? Let SeniorBuddy check if it is a scam before you respond.
            </p>
          </div>
        </div>

        <SpeechSpeaker
          text="Welcome to Scam Shield. If you received a suspicious text message, email, or phone call, paste it here or choose a test example below. SeniorBuddy will tell you if it is safe or a scam."
          label="Listen to Guide"
          size="md"
        />
      </div>

      {/* Main Checker Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-stone-900">
          Check a Message, Phone Call, or Letter
        </h2>

        {/* Preset Sample Scams to Test */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
            Try a common scam example with 1 tap:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sampleScams.map((scam, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setMessage(scam.text);
                  analyzeMessage(scam.text);
                }}
                disabled={isLoading}
                className="p-4 rounded-2xl border-2 border-stone-200 hover:border-rose-400 bg-stone-50 hover:bg-rose-50/50 text-left transition-all cursor-pointer"
              >
                <p className="font-black text-stone-900 text-base">{scam.title}</p>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1">{scam.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-stone-800">
            Or paste what someone said, texted, or emailed you:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Someone called saying they are from Medicare and need my card number to send a refund..."
            rows={5}
            className="w-full text-lg sm:text-xl p-4 rounded-2xl border-2 border-stone-300 focus:border-rose-500 focus:outline-hidden"
          />
        </div>

        {/* Photo Upload Option */}
        <div className="p-4 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-stone-900 text-base">Or attach a photo of the letter or screen:</p>
            <p className="text-sm text-stone-600">Take a photo of a letter you received in the mailbox</p>
          </div>
          <input
            type="file"
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="scam-image-input"
          />
          <label
            htmlFor="scam-image-input"
            className="bg-white hover:bg-stone-100 text-stone-800 font-bold px-5 py-2.5 rounded-xl border border-stone-300 shadow-2xs cursor-pointer"
          >
            📷 Attach Photo
          </label>
        </div>

        {/* Image Preview if selected */}
        {imagePreview && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Document to check"
                className="w-20 h-20 rounded-xl object-cover border border-amber-400"
              />
              <p className="font-bold text-stone-800 text-sm">{selectedImage?.name}</p>
            </div>
            <button
              type="button"
              onClick={analyzeImage}
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Analyze Photo
            </button>
          </div>
        )}

        {/* Check Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => analyzeMessage()}
            disabled={isLoading || !message.trim()}
            className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xl py-4 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            {isLoading ? '⏳ SeniorBuddy is Checking...' : '🛡️ Check If This Is Safe'}
          </button>
          {analysis && (
            <button
              type="button"
              onClick={clearAll}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-6 py-4 rounded-2xl text-lg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Banner */}
        {analysis && (
          <div className="space-y-6 pt-6 border-t border-stone-200">
            <div
              className={`p-6 rounded-3xl border-3 shadow-md space-y-3 ${
                analysis.isScam
                  ? 'bg-red-50 border-red-500 text-red-950'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{analysis.isScam ? '🚨' : '✅'}</span>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    {analysis.isScam ? 'Scam Warning: Do Not Respond!' : 'Appears to be Safe'}
                  </h3>
                </div>

                <SpeechSpeaker text={analysis.result} size="sm" label="Read Advice" />
              </div>

              <div className="text-lg leading-relaxed font-medium whitespace-pre-wrap pt-2">
                {analysis.result}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Golden Rules for Staying Safe */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-sm space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-3">
          <span>⭐</span> 4 Golden Safety Rules Every Senior Should Know
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-2">
            <span className="text-3xl">💳</span>
            <h3 className="text-xl font-black text-amber-950">1. Never Pay with Gift Cards</h3>
            <p className="text-stone-700 text-base">
              No government agency, utility company, or real business will ever ask you to buy Target, Apple, or Google Play gift cards to pay a bill or fine.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-2">
            <span className="text-3xl">🔢</span>
            <h3 className="text-xl font-black text-blue-950">2. Keep Your 6-Digit Codes Secret</h3>
            <p className="text-stone-700 text-base">
              If your phone receives a text message with a 6-digit verification code, never read it out to anyone over the phone—even if they claim to be your bank!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-50 border-2 border-purple-200 space-y-2">
            <span className="text-3xl">📞</span>
            <h3 className="text-xl font-black text-purple-950">3. Hang Up & Call Directly</h3>
            <p className="text-stone-700 text-base">
              If someone calls claiming a family member is in jail, hospital, or trouble, hang up immediately and dial that family member or their parents directly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-2">
            <span className="text-3xl">🐢</span>
            <h3 className="text-xl font-black text-emerald-950">4. Slow Down! Urgency Is a Trick</h3>
            <p className="text-stone-700 text-base">
              Scammers try to panic you by saying &quot;You must act within 10 minutes.&quot; Take a deep breath. Real problems can wait for you to ask your family first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
