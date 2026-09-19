'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [showSosModal, setShowSosModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFontSize, setActiveFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  const setFontSize = (size: 'normal' | 'large' | 'huge', px: string) => {
    setActiveFontSize(size);
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = px;
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/assistant', label: 'AI Companion', icon: '💬' },
    { href: '/my-day', label: 'My Day', icon: '📅' },
    { href: '/medications', label: 'Pill Tracker', icon: '💊' },
    { href: '/bills', label: 'Scan Bills', icon: '📄' },
    { href: '/safety', label: 'Scam Shield', icon: '🛡️' },
    { href: '/help', label: 'Contacts', icon: '📞' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Brand Logo - shrink-0 to prevent squishing */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 no-underline group focus:outline-hidden shrink-0"
            >
              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl sm:text-2xl shadow-xs text-white transform group-hover:scale-105 transition-transform shrink-0">
                👵
              </span>
              <div className="leading-tight shrink-0">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-stone-900 block">
                  Senior<span className="text-amber-600">Buddy</span>
                </span>
                <span className="hidden sm:block text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-widest">
                  Your Daily Companion
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Always in ONE line, never wraps */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 shrink-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 2xl:px-3 2xl:py-2 rounded-xl text-sm 2xl:text-[15px] font-bold whitespace-nowrap shrink-0 transition-colors no-underline ${
                      isActive
                        ? 'bg-amber-100 text-amber-900 shadow-xs'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                    }`}
                  >
                    <span className="text-lg 2xl:text-xl shrink-0">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Accessibility Controls & Emergency SOS */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Text Size Scaler (Desktop / Tablet view: hidden on mobile to prevent crowding) */}
              <div
                className="hidden md:flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200 shrink-0"
                title="Change Text Size"
                role="group"
                aria-label="Text Size Controls"
              >
                <button
                  type="button"
                  onClick={() => setFontSize('normal', '17px')}
                  className={`compact-btn px-2 py-0.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeFontSize === 'normal'
                      ? 'bg-white text-amber-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="Normal font size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large', '21px')}
                  className={`compact-btn px-2 py-0.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeFontSize === 'large'
                      ? 'bg-white text-amber-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="Large font size"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('huge', '25px')}
                  className={`compact-btn px-2 py-0.5 text-sm font-black rounded-lg transition-all cursor-pointer ${
                    activeFontSize === 'huge'
                      ? 'bg-white text-amber-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-label="Extra large font size"
                >
                  A++
                </button>
              </div>

              {/* Emergency SOS Button */}
              <button
                type="button"
                onClick={() => setShowSosModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md flex items-center gap-1.5 text-sm sm:text-base transition-all transform hover:scale-105 cursor-pointer border border-red-700 shrink-0 whitespace-nowrap"
                aria-label="Emergency SOS call contacts"
              >
                <span className="text-base sm:text-lg animate-pulse">🚨</span>
                <span className="tracking-wide">SOS</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden compact-btn p-1.5 sm:p-2 rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-300 text-lg sm:text-xl font-bold shrink-0 cursor-pointer flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="xl:hidden bg-amber-50/95 border-t border-amber-200 px-4 pt-3 pb-6 space-y-2">
            {/* Mobile Font Size Adjustment Card */}
            <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-2 flex items-center gap-1.5">
                <span>🔍</span> Easy Reading Font Size:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize('normal', '17px')}
                  className={`compact-btn py-2 px-2 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                    activeFontSize === 'normal'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50'
                  }`}
                  aria-label="Standard font size"
                >
                  A Standard
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large', '21px')}
                  className={`compact-btn py-2 px-2 rounded-xl font-bold text-sm border text-center transition-all cursor-pointer ${
                    activeFontSize === 'large'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50'
                  }`}
                  aria-label="Large font size"
                >
                  A+ Large
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('huge', '25px')}
                  className={`compact-btn py-2 px-2 rounded-xl font-black text-base border text-center transition-all cursor-pointer ${
                    activeFontSize === 'huge'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50'
                  }`}
                  aria-label="Extra large font size"
                >
                  A++ Huge
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base sm:text-lg font-bold transition-all no-underline ${
                    isActive
                      ? 'bg-amber-200 text-amber-950 shadow-xs'
                      : 'bg-white text-stone-800 hover:bg-amber-100 border border-amber-100'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* SOS Modal */}
      {showSosModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-red-500 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                  🚨
                </span>
                <div>
                  <h2 className="text-2xl font-black text-stone-900">Emergency SOS</h2>
                  <p className="text-stone-600 font-medium text-sm">Tap any number to call immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="compact-btn w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <a
                href="tel:911"
                className="flex items-center justify-between p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xl shadow-md no-underline transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚑</span>
                  <div>
                    <div>Call 911</div>
                    <div className="text-xs text-red-100 font-normal">Police / Ambulance / Fire</div>
                  </div>
                </div>
                <span className="bg-white text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold">CALL NOW</span>
              </a>

              <a
                href="tel:+15552345678"
                className="flex items-center justify-between p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-md no-underline transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👩</span>
                  <div>
                    <div>Sarah (Daughter)</div>
                    <div className="text-xs text-emerald-100 font-normal">Primary Family Caregiver</div>
                  </div>
                </div>
                <span className="bg-white text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold">CALL</span>
              </a>

              <a
                href="tel:+15559876543"
                className="flex items-center justify-between p-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg shadow-md no-underline transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🩺</span>
                  <div>
                    <div>Dr. Sharma</div>
                    <div className="text-xs text-sky-100 font-normal">Primary Care Physician</div>
                  </div>
                </div>
                <span className="bg-white text-sky-900 px-3 py-1.5 rounded-lg text-sm font-bold">CALL</span>
              </a>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-base cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
