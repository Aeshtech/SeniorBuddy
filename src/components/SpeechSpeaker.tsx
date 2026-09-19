'use client';

import { useState, useEffect } from 'react';

interface SpeechSpeakerProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SpeechSpeaker({ text, label = 'Read aloud', size = 'md' }: SpeechSpeakerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const cleanText = text.replace(/[*#_`]/g, ''); // strip markdown chars
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower, clearer speech for seniors
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2.5 font-bold',
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center rounded-xl font-bold transition-all border shadow-xs cursor-pointer ${
        sizeClasses[size]
      } ${
        isSpeaking
          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
      }`}
      aria-label={isSpeaking ? 'Stop speaking' : `Read aloud: ${label}`}
      title={isSpeaking ? 'Click to stop reading' : 'Click to hear this read aloud'}
    >
      <span className="text-lg">{isSpeaking ? '⏹️' : '🔊'}</span>
      <span>{isSpeaking ? 'Stop' : label}</span>
    </button>
  );
}
