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
   - AI highlights red flags (urgent threats, gift cards, OTP requests, fake lottery).
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
- **Database**: In-memory database store (Vercel serverless compatible, zero native C++ binaries)

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

## 🔒 Senior Accessibility Principles Applied

- **Legibility**: 19px base font size, warm stone/amber background contrast that avoids harsh glare.
- **Cognitive Ease**: No multi-step nested menus; clear emoji badges accompanying every action.
- **Audio Redundancy**: Every analysis, reminder, and schedule can be listened to aloud.
- **Mistake Tolerance**: Big confirmation buttons and non-destructive toggles.

---

## 📄 License
MIT License. Built with ❤️ for our elders.
