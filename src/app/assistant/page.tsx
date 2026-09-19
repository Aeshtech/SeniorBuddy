'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SpeechSpeaker from '@/components/SpeechSpeaker';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  actionLink?: { href: string; label: string };
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm SeniorBuddy, your patient digital companion. How can I help you today? You can type, speak using the microphone, or ask me about your medicines, bills, appointments, or suspicious messages.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL query parameter ?q=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');
      if (initialQuery) {
        sendMessage(initialQuery);
      }
    }
  }, []);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend.trim(),
      image: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (selectedImage) {
        // Upload & analyze image with context
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('context', textToSend || 'Please analyze this image and explain it simply.');
        formData.append('autoSave', 'true');

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        let reply = data.analysis || 'I analyzed the image for you.';
        if (data.data?.isSuspicious) {
          reply = `⚠️ WARNING: This document looks suspicious!\n\n${data.data.suspicionReason}\n\nRecommended action: ${data.data.actionNeeded}`;
        } else if (data.data?.amountDue) {
          reply = `📄 Found a bill from ${data.data.vendor || 'provider'} for $${Number(data.data.amountDue).toFixed(2)} due on ${data.data.dueDate || 'specified date'}.\n\n${data.data.summary}\n\nAction needed: ${data.data.actionNeeded}`;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
          },
        ]);

        setSelectedImage(null);
        setImagePreview(null);
      } else {
        // Standard conversational agent
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        let actionLink = undefined;
        if (data.toolCalls && data.toolCalls.length > 0) {
          const names = data.toolCalls.map((tc: any) => tc.function?.name);
          if (names.includes('create_reminder') || names.includes('add_appointment') || names.includes('get_my_day')) {
            actionLink = { href: '/my-day', label: '📅 View on My Day Schedule ➔' };
          } else if (names.includes('toggle_medication') || names.includes('add_medication') || names.includes('get_medications')) {
            actionLink = { href: '/medications', label: '💊 Open Pill Tracker ➔' };
          } else if (names.includes('log_bill') || names.includes('get_bills')) {
            actionLink = { href: '/bills', label: '📄 View Saved Bills ➔' };
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message || "I'm right here with you. What would you like to check next?",
            actionLink,
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had a slight hiccup answering, but please ask again. I am here for you!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
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

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Voice Input (Speech-to-Text)
  const handleVoiceListen = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const sampleQuestions = [
    { label: '💊 What pills do I take today?', query: 'What pills and medications do I need to take today?' },
    { label: '🩺 When is my doctor visit?', query: 'When is my next doctor appointment and what should I bring?' },
    { label: '📄 Read an attached bill', query: 'Can you look at this bill and tell me how much I owe?' },
    { label: '🛡️ Is this text message safe?', query: 'Someone texted me saying my bank is suspended and asked to click a link. Is this safe?' },
    { label: '⏰ Remind me to drink water', query: 'Please create a reminder for me to drink 2 glasses of water every afternoon.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 flex-1 flex flex-col">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 p-6 rounded-3xl border-2 border-amber-200">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-sm">
            👵
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              SeniorBuddy Companion
            </h1>
            <p className="text-stone-600 font-medium text-base">
              Talk, ask questions, or attach photos of letters and bills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SpeechSpeaker
            text="I am SeniorBuddy, your friendly helper. Ask me any question or tap the microphone to speak."
            label="Audio Help"
            size="sm"
          />
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          Suggested Questions — Tap to ask:
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(q.query)}
              disabled={isLoading}
              className="bg-white hover:bg-amber-100 text-stone-800 text-sm sm:text-base font-bold px-3.5 py-2 rounded-xl border border-stone-300 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-sm p-4 sm:p-6 mb-4 flex-1 overflow-y-auto min-h-[420px] max-h-[600px] space-y-4">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 px-2">
                <span>{isUser ? 'You' : 'SeniorBuddy'}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] p-5 rounded-3xl text-lg sm:text-xl leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-xs'
                    : 'bg-stone-100 text-stone-900 border border-stone-200 rounded-tl-xs'
                }`}
              >
                {message.image && (
                  <div className="mb-3">
                    <img
                      src={message.image}
                      alt="Uploaded preview"
                      className="max-h-64 rounded-2xl border border-stone-300 object-cover"
                    />
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.actionLink && (
                  <div className="mt-3">
                    <Link
                      href={message.actionLink.href}
                      className="inline-flex items-center gap-2 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black px-4 py-2 rounded-xl text-sm sm:text-base transition-all no-underline shadow-2xs"
                    >
                      {message.actionLink.label}
                    </Link>
                  </div>
                )}

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-end">
                    <SpeechSpeaker text={message.content} size="sm" label="Listen" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-xs animate-pulse">
            <span className="text-2xl">⏳</span>
            <span className="text-base font-bold text-stone-700">SeniorBuddy is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview Pill */}
      {imagePreview && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Ready to upload"
              className="w-16 h-16 rounded-xl object-cover border border-amber-400"
            />
            <div>
              <p className="font-bold text-sm text-stone-900">{selectedImage?.name}</p>
              <p className="text-xs text-stone-600">Attached image will be analyzed with Gemini Vision</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="text-red-700 hover:bg-red-100 p-2 rounded-xl text-sm font-bold cursor-pointer"
          >
            Remove ✕
          </button>
        </div>
      )}

      {/* Input Form with Voice & Photo Buttons */}
      <div className="bg-white rounded-3xl border-2 border-stone-300 p-3 shadow-md flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
          id="chat-image-input"
        />

        {/* Camera / Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-2xl font-bold cursor-pointer transition-all shrink-0"
          title="Attach photo of a bill, pill bottle, or letter"
          aria-label="Attach photo"
        >
          📷
        </button>

        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={handleVoiceListen}
          disabled={isLoading}
          className={`p-3.5 rounded-2xl text-2xl font-bold cursor-pointer transition-all shrink-0 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
          }`}
          title={isListening ? 'Listening... Tap to stop' : 'Tap to speak your question'}
          aria-label="Speak into microphone"
        >
          🎙️
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder={isListening ? 'Listening to your voice...' : 'Type or speak your question...'}
          disabled={isLoading}
          className="flex-1 text-lg sm:text-xl px-4 py-3 bg-transparent focus:outline-hidden font-medium text-stone-900"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || (!input.trim() && !selectedImage)}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-black text-lg sm:text-xl px-6 sm:px-8 py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>Send</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
