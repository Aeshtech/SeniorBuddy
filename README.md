# 👵 SeniorBuddy — AI Daily Companion for Seniors & Caregivers

A GenAI-powered daily companion designed for senior citizens and grandparents to stay independent, organized, healthy, and safe in an increasingly digital world. Built for the **Hack2Skill Google Hackathon**.

Powered by **Google Gemini 2.5 Flash via OpenRouter API** with vision OCR, speech synthesis, and intelligent tool calling.

---

## ✨ Key Features

1. **💬 Empathetic AI Companion**
   - Natural, patient conversations without technical jargon.
   - Built-in **Web Speech API** for voice input (speech-to-text) and spoken audio responses (text-to-speech).
   - Tool calling enables SeniorBuddy to schedule reminders, record doctor visits, and log medications directly from conversation.

2. **📄 Bill & Document Scanner (Vision AI)**
   - Upload or photograph utility bills, medical receipts, or mail notices.
   - Gemini Vision extracts vendor, amount due, and due date in huge, readable fonts.
   - Automatically detects fake invoices and suspicious billing traps.
   - One-tap "Save to My Bills" feature.

3. **💊 Daily Pill & Medication Tracker**
   - Track scheduled morning, afternoon, and evening pills.
   - Large touch-friendly checkmarks for marking medicines as taken.
   - Spoken dosage instructions and refill warnings.
   - Add new medicines with custom dosages and meal timing notes.

4. **🛡️ Scam & Fraud Shield**
   - Paste suspicious text messages, caller demands, or email warnings.
   - AI highlights red flags (urgent threats, gift cards, OTP requests, fake lottery, bitcoin demands).
   - Quick one-tap testing presets for common scams (IRS arrest warrant, imposter grandchild, fake bank lock).
   - 4 Golden Safety Rules designed specifically for seniors.

5. **📅 My Day Daily Schedule & Printable Planner**
   - Consolidates doctor appointments, medications, routines, and reminders.
   - One-click **Print Daily Schedule** button for refrigerator or bedside display.
   - Audio readout of the day's entire agenda.

6. **🚨 Emergency SOS & Caregiver Speed Dial**
   - Sticky Emergency SOS button in the top navigation bar.
   - Instant one-tap calling to 911, primary caregiver (daughter Sarah), and family doctor.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom senior accessibility tokens (large fonts, 48px+ touch targets, warm color contrast)
- **AI Model**: `google/gemini-2.5-flash` via [OpenRouter](https://openrouter.ai/)
- **Audio & Accessibility**: Web Speech API (SpeechSynthesis & SpeechRecognition)
- **Database**: In-memory Map-based store (Vercel serverless compatible, zero native C++ binaries)
- **Security**: Centralized sanitization middleware, rate limiting, scam detection heuristics

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Aeshtech/SeniorBuddy.git
cd SeniorBuddy
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=google/gemini-2.5-flash
NEXT_PUBLIC_APP_NAME=SeniorBuddy
```

*(Note: Also supports `OPENAI_API_KEY` for OpenAI-compatible proxies).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Run Automated Tests
```bash
npm test
```
Runs **69 tests across 10 test suites** covering security, sanitization, rate limiting, scam detection, date normalization, API hardening, security middleware, efficiency, and code quality — achieving **100% pass rate**.

---

## 🔒 Security Architecture

SeniorBuddy implements a multi-layer security model specifically designed to protect vulnerable senior users:

### 1. No Hardcoded Secrets
All API credentials are loaded exclusively from environment variables (`process.env.OPENROUTER_API_KEY`). Zero secrets appear in source code or client bundles.

### 2. Centralized Input Sanitization (`src/lib/security/sanitize.ts`)
Every API route (`/api/bills`, `/api/reminders`, `/api/medications`, `/api/analyze-image`) passes all user input through a shared sanitization module before processing:
- **HTML/Script Injection Prevention**: Strips `<`, `>`, `'`, `"`, `` ` ``, and `;` characters
- **Length Limits**: Enforces per-field character limits (200 chars for titles, 500 for notes)
- **Type Coercion Attacks**: Explicit type checks reject non-string inputs for string fields
- **Amount Range Validation**: Numeric fields validated to `[0, 1,000,000]` range
- **Date Format Validation**: Strict `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` regex enforcement
- **File Upload Security**: Image analysis endpoint validates MIME type and enforces 10MB file size limit

### 3. API Rate Limiting
In-memory sliding window rate limiter (30 requests/minute per IP) protects **all 6 API endpoints** from abuse. Returns HTTP `429 Too Many Requests`.

### 4. Security Middleware (`src/middleware.ts`)
A Next.js middleware applies OWASP-recommended headers to **every response**:
- `Content-Security-Policy` — restricts script sources, blocks iframes, limits connections to `openrouter.ai`
- `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing attacks
- `X-Frame-Options: DENY` — prevents clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin` — protects URL leakage
- `Permissions-Policy` — disables camera/geolocation, allows microphone (for speech)

### 5. CSRF Protection
Mutating API requests (`POST/PUT/PATCH/DELETE`) validate that the `Origin` header matches the `Host` header, rejecting cross-origin requests with `403 Forbidden`.

### 6. Custom Error Class
`ValidationError` class cleanly separates user input errors (400) from server errors (500), preventing sensitive stack traces from leaking to clients.

### 7. Scam Detection Engine
16-keyword heuristic engine flags predatory patterns: IRS threats, gift card demands, OTP requests, remote access scams, bitcoin demands, and more — with risk scoring (low/medium/high).

### 8. Agent API Hardening
- Message array capped at 50 messages per request
- Individual message content capped at 2000 characters
- Action and context strings sanitized with HTML stripping

---

## ⚡ Efficiency Architecture

### O(1) In-Memory Data Store
Replaced blocking `better-sqlite3` (native C++ binaries incompatible with Vercel's edge/serverless runtime) with a `Map<id, Record>`-based in-memory store:
- **O(1) reads and writes** via `Map.get()` / `Map.set()` vs O(n) array scans
- **Zero cold-start native compilation** — fully compatible with Vercel serverless
- **Persisted across hot reloads** via `globalThis.__seniorBuddyStore` singleton
- **Sorted views** computed on demand with `Array.from(map.values()).sort()`

### Response Caching
- My-day API returns `Cache-Control: private, max-age=5, stale-while-revalidate=10` for dashboard freshness without redundant server hits

### Lazy AI Computation
- Tool calls are only made when the AI agent determines they are necessary
- Two-phase LLM pattern: tools execute first, then a final summarization call
- `max_tokens: 1000` budget prevents runaway token consumption

---

## 🧪 Test Coverage

```
Suite 1:  AI Agent Tool Schema Compliance        ✅  3/3
Suite 2:  Fuzzy Date & Time Normalization         ✅  9/9
Suite 3:  Scam & Fraud Detection Engine           ✅  7/7
Suite 4:  Secret & Environment Security           ✅  5/5
Suite 5:  Input Sanitization Logic                ✅ 15/15
Suite 6:  Rate Limiting Logic                     ✅  4/4
Suite 7:  Efficiency & Data Integrity             ✅  5/5
Suite 8:  API Route Security Hardening            ✅ 11/11
Suite 9:  Accessibility & Code Quality            ✅  4/4
Suite 10: Security Middleware & Headers            ✅  6/6

Total: 69/69 (100%) 🏆
```

---

## ☁️ Vercel Deployment

1. Push code to GitHub: `https://github.com/Aeshtech/SeniorBuddy.git`.
2. Link repository to Vercel at [https://vercel.com/aeshtechs-projects/senior-buddy](https://vercel.com/aeshtechs-projects/senior-buddy).
3. In the Vercel project settings, add the Environment Variables:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_BASE_URL` (set to `https://openrouter.ai/api/v1`)
   - `OPENROUTER_MODEL` (set to `google/gemini-2.5-flash`)
4. Trigger a deployment. Build will succeed with zero native dependency errors!

---

## ♿ Senior Accessibility Principles Applied

- **Legibility**: 19px base font size, warm stone/amber background contrast that avoids harsh glare.
- **Cognitive Ease**: No multi-step nested menus; clear emoji badges accompanying every action.
- **Audio Redundancy**: Every analysis, reminder, and schedule can be listened to aloud.
- **Mistake Tolerance**: Big confirmation buttons and non-destructive toggles.
- **Font Scaling**: A / A+ / A++ in-app text-size selector available from the header.
- **Touch Target Size**: All interactive elements ≥48px height, meeting WCAG 2.5.5 AAA.
- **ARIA Compliance**: All interactive controls labeled with `aria-label` and correct roles.
- **Semantic HTML**: `lang="en"`, `<main>`, `<header>`, `<footer>`, proper heading hierarchy.

---

## 📄 License
MIT License. Built with ❤️ for our elders.

