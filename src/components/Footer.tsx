import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-10 mt-auto border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="text-3xl">👵👴</span>
            <div>
              <p className="text-white font-black text-lg">SeniorBuddy — Built for Care & Independence</p>
              <p className="text-stone-400 text-sm">Powered by Google Gemini 2.0 Flash & OpenRouter AI</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
            <Link href="/" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              Home
            </Link>
            <Link href="/assistant" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              AI Companion
            </Link>
            <Link href="/medications" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              Pill Tracker
            </Link>
            <Link href="/bills" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              Bills & Documents
            </Link>
            <Link href="/safety" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              Scam Shield
            </Link>
            <Link href="/help" className="hover:text-amber-400 no-underline text-stone-300 transition-colors">
              Emergency Contacts
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
          SeniorBuddy does not replace 911 in life-threatening emergencies. If experiencing chest pain or severe difficulty breathing, call 911 immediately.
        </div>
      </div>
    </footer>
  );
}
