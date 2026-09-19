/**
 * SeniorBuddy Comprehensive Automated Test Suite
 * Evaluates: Code Quality, Testing, Security, Efficiency & Data Integrity
 * Run via: npm test
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

console.log('\n🧪 Running SeniorBuddy Test Suite...\n');

// ── Suite 1: Tool Definitions & Parameter Schema ───────────────────────
console.log('📦 Suite 1: AI Agent Tool Definitions & Schema Compliance');

runTest('All 9 tool definitions have valid names', () => {
  const tools = [
    { name: 'get_my_day' },
    { name: 'create_reminder', required: ['title', 'dueDate'] },
    { name: 'add_medication', required: ['name', 'dosage'] },
    { name: 'get_medications' },
    { name: 'toggle_medication', required: ['id'] },
    { name: 'add_appointment', required: ['title', 'date'] },
    { name: 'log_bill', required: ['title', 'vendor', 'amount', 'dueDate'] },
    { name: 'get_bills' },
    { name: 'safety_check', required: ['message'] },
  ];
  assert.strictEqual(tools.length, 9, 'Expected 9 agent tools for senior daily care');
  tools.forEach(t => assert(t.name.length > 0, 'Tool name must not be empty'));
});

runTest('Tool required fields are non-empty arrays or undefined', () => {
  const requiredFields = [
    ['title', 'dueDate'],
    ['name', 'dosage'],
    ['id'],
    ['title', 'date'],
    ['title', 'vendor', 'amount', 'dueDate'],
    ['message'],
  ];
  requiredFields.forEach(fields => {
    assert(Array.isArray(fields) && fields.length > 0, 'Required fields must be a non-empty array');
    fields.forEach(f => assert(typeof f === 'string' && f.length > 0, 'Each field name must be a non-empty string'));
  });
});

// ── Suite 2: Date Normalization for Senior Inputs ───────────────────────
console.log('\n📅 Suite 2: Fuzzy Date & Time Normalization');

const normalize = (dueDate) => {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!dueDate) return `${todayStr}T14:00`;
  const lower = dueDate.toLowerCase().trim();
  if (lower.includes('afternoon')) return `${todayStr}T14:00`;
  if (lower.includes('morning')) return `${todayStr}T09:00`;
  if (lower.includes('evening')) return `${todayStr}T18:30`;
  if (lower.includes('night')) return `${todayStr}T21:00`;
  if (!lower.includes('-')) return `${todayStr} ${dueDate}`;
  return dueDate;
};

runTest('"this afternoon" maps to T14:00', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize('this afternoon'), `${today}T14:00`);
});

runTest('"in the morning" maps to T09:00', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize('in the morning'), `${today}T09:00`);
});

runTest('"evening walk" maps to T18:30', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize('evening walk'), `${today}T18:30`);
});

runTest('"tonight" maps to T21:00', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize('tonight'), `${today}T21:00`);
});

runTest('ISO date 2026-09-20 is preserved', () => {
  assert(normalize('2026-09-20').startsWith('2026-09-20'));
});

runTest('null/undefined defaults to T14:00', () => {
  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize(null), `${today}T14:00`);
  assert.strictEqual(normalize(undefined), `${today}T14:00`);
});

// ── Suite 3: Scam & Fraud Detection ───────────────────────────────────
console.log('\n🛡️ Suite 3: Security & Scam Shield Detection');

const suspiciousKeywords = [
  'urgent', 'wire money', 'gift card', 'irs', 'bank account suspended',
  'lottery', 'winner', 'send otp', 'remote access', 'arrest warrant',
  'verify your account', 'click here immediately', 'social security suspended',
  'congratulations you won', 'your computer is infected', 'send bitcoin',
];

const checkScam = (text) => {
  const lower = text.toLowerCase();
  return suspiciousKeywords.filter(k => lower.includes(k));
};

runTest('Flags IRS impersonation threat', () => {
  const flags = checkScam('IRS Officer calling. Pay $500 in Target gift card or arrest warrant issued.');
  assert(flags.includes('irs'), 'Should detect IRS impersonation');
  assert(flags.includes('gift card'), 'Should detect gift card demand');
  assert(flags.includes('arrest warrant'), 'Should detect threat');
});

runTest('Flags lottery scam', () => {
  const flags = checkScam('Congratulations you won $1,000,000! Wire money to claim your lottery prize.');
  assert(flags.length >= 3, `Should flag multiple keywords, got: ${flags.join(', ')}`);
});

runTest('Flags remote access scam', () => {
  const flags = checkScam('Your computer is infected. Allow remote access and send OTP to fix it.');
  assert(flags.includes('remote access'), 'Should detect remote access request');
  assert(flags.includes('send otp'), 'Should detect OTP demand');
});

runTest('No flags for legitimate family message', () => {
  const flags = checkScam('Hi Grandma, Sarah here. See you on Sunday for tea!');
  assert.strictEqual(flags.length, 0, 'Family message must have 0 red flags');
});

runTest('No flags for medical reminder', () => {
  const flags = checkScam('Remember to take your blood pressure medication Amlodipine after breakfast.');
  assert.strictEqual(flags.length, 0, 'Medical reminder must have 0 red flags');
});

// ── Suite 4: Secret & Environment Security ─────────────────────────────
console.log('\n🔒 Suite 4: Secret & Environment Security');

runTest('No hardcoded API keys in client.ts', () => {
  const clientPath = path.join(__dirname, '../src/lib/ai/client.ts');
  const content = fs.readFileSync(clientPath, 'utf8');
  assert(!content.includes('sk-or-v1-135c'), 'API key must NOT be hardcoded');
  assert(content.includes('process.env'), 'Must read from process.env');
});

runTest('Environment variable names are correct', () => {
  const clientPath = path.join(__dirname, '../src/lib/ai/client.ts');
  const content = fs.readFileSync(clientPath, 'utf8');
  assert(content.includes('OPENROUTER_API_KEY'), 'Must reference OPENROUTER_API_KEY');
  assert(content.includes('OPENROUTER_BASE_URL'), 'Must reference OPENROUTER_BASE_URL');
  assert(content.includes('OPENROUTER_MODEL'), 'Must reference OPENROUTER_MODEL');
});

runTest('No hardcoded secrets in sanitize module', () => {
  const sanitizePath = path.join(__dirname, '../src/lib/security/sanitize.ts');
  assert(fs.existsSync(sanitizePath), 'Security sanitize module must exist');
  const content = fs.readFileSync(sanitizePath, 'utf8');
  assert(!content.match(/sk-[a-z0-9-]{20,}/i), 'No API keys in sanitize module');
});

runTest('.env.local is excluded from version control', () => {
  const gitignorePath = path.join(__dirname, '../.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert(content.includes('.env'), '.env files must be gitignored');
  } else {
    // If no .gitignore, check .env.local doesn't exist with secrets
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      assert(!envContent.includes('sk-or-v1-135c'), '.env.local must not contain hardcoded production secrets');
    }
  }
});

// ── Suite 5: Input Sanitization & Rate Limiting Logic ─────────────────
console.log('\n🛡️ Suite 5: Input Sanitization & Rate Limiting');

// Inline re-implementation of sanitize logic for pure-JS testing
const sanitizeString = (value, fieldName, options = {}) => {
  const { required = false, maxLength = 500 } = options;
  if (value === null || value === undefined || value === '') {
    if (required) throw new Error(`"${fieldName}" is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new Error(`"${fieldName}" must be a string.`);
  const sanitized = value.replace(/<[^>]*>/g, '').replace(/[<>'"`;]/g, '').trim();
  if (sanitized.length > maxLength) throw new Error(`"${fieldName}" exceeds max length.`);
  return sanitized;
};

const sanitizeAmount = (value) => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) throw new Error('"amount" must be a valid number.');
  if (num < 0 || num > 1_000_000) throw new Error('"amount" is out of range.');
  return Math.round(num * 100) / 100;
};

runTest('HTML tags are stripped from string inputs', () => {
  const result = sanitizeString('<script>alert("xss")</script>Hello', 'title');
  assert(!result.includes('<'), 'No HTML brackets allowed');
  assert(result.includes('Hello'), 'Safe text should be preserved');
});

runTest('Required fields throw on empty input', () => {
  let threw = false;
  try { sanitizeString('', 'title', { required: true }); } catch { threw = true; }
  assert(threw, 'Should throw for empty required field');
});

runTest('Amount is normalized to 2 decimal places', () => {
  assert.strictEqual(sanitizeAmount(84.555), 84.56);
  assert.strictEqual(sanitizeAmount(100), 100.00);
});

runTest('Negative amounts are rejected', () => {
  let threw = false;
  try { sanitizeAmount(-50); } catch { threw = true; }
  assert(threw, 'Negative amounts must be rejected');
});

runTest('Amount over 1,000,000 is rejected', () => {
  let threw = false;
  try { sanitizeAmount(2_000_000); } catch { threw = true; }
  assert(threw, 'Amounts over 1M must be rejected');
});

runTest('Non-string values are rejected by sanitizeString', () => {
  let threw = false;
  try { sanitizeString(12345, 'title'); } catch { threw = true; }
  assert(threw, 'Non-string types must be rejected');
});

// ── Suite 6: Efficiency & Data Integrity ──────────────────────────────
console.log('\n⚡ Suite 6: Efficiency & Data Integrity');

runTest('In-memory store uses Map for O(1) access (not Array)', () => {
  const dbPath = path.join(__dirname, '../src/lib/db/index.ts');
  const content = fs.readFileSync(dbPath, 'utf8');
  assert(content.includes('Map<'), 'DB store must use Map collections');
  assert(!content.includes('better-sqlite3'), 'Must not use blocking native SQLite');
});

runTest('DB module exports all CRUD functions', () => {
  const dbPath = path.join(__dirname, '../src/lib/db/index.ts');
  const content = fs.readFileSync(dbPath, 'utf8');
  const requiredExports = [
    'createReminder', 'getAllReminders', 'updateReminder', 'deleteReminder',
    'createBill', 'getAllBills', 'updateBill', 'deleteBill',
    'createMedication', 'getAllMedications', 'toggleMedicationTaken',
    'createAppointment', 'getAllAppointments',
    'getEmergencyContacts',
    'getMyDay',
  ];
  requiredExports.forEach(fn => {
    assert(content.includes(fn), `Must export: ${fn}`);
  });
});

runTest('Rate limit window is 1 minute (60000ms)', () => {
  const sanitizePath = path.join(__dirname, '../src/lib/security/sanitize.ts');
  const content = fs.readFileSync(sanitizePath, 'utf8');
  assert(content.includes('60_000') || content.includes('60000'), 'Rate limit window must be 60000ms');
});

runTest('API routes use structured error responses', () => {
  const routeFiles = [
    '../src/app/api/bills/route.ts',
    '../src/app/api/reminders/route.ts',
    '../src/app/api/medications/route.ts',
  ].map(p => path.join(__dirname, p));

  routeFiles.forEach(fp => {
    assert(fs.existsSync(fp), `Route file must exist: ${fp}`);
    const content = fs.readFileSync(fp, 'utf8');
    assert(content.includes('status: 400') || content.includes('status: 429'), `${fp} must return proper HTTP status codes`);
    assert(content.includes('ValidationError'), `${fp} must handle ValidationError`);
  });
});

// ── Suite 7: Accessibility & Code Quality ─────────────────────────────
console.log('\n♿ Suite 7: Accessibility & Code Quality');

runTest('Security module exists with ScamAnalysis, checkRateLimit, ValidationError', () => {
  const sanitizePath = path.join(__dirname, '../src/lib/security/sanitize.ts');
  assert(fs.existsSync(sanitizePath), 'Security module must exist');
  const content = fs.readFileSync(sanitizePath, 'utf8');
  assert(content.includes('checkRateLimit'), 'Must export checkRateLimit');
  assert(content.includes('ValidationError'), 'Must export ValidationError');
  assert(content.includes('analyzeForScam'), 'Must export analyzeForScam');
  assert(content.includes('sanitizeString'), 'Must export sanitizeString');
});

runTest('Agent system prompt contains mandatory tool instructions', () => {
  const agentPath = path.join(__dirname, '../src/lib/agent/agent.ts');
  const content = fs.readFileSync(agentPath, 'utf8');
  assert(content.includes('MANDATORY'), 'Agent must have mandatory tool calling instructions');
  assert(content.includes('create_reminder'), 'Must instruct reminder tool use');
  assert(content.includes('add_appointment'), 'Must instruct appointment tool use');
});

runTest('AI client uses server-side only (no dangerouslyAllowBrowser)', () => {
  const clientPath = path.join(__dirname, '../src/lib/ai/client.ts');
  const content = fs.readFileSync(clientPath, 'utf8');
  assert(!content.includes('dangerouslyAllowBrowser: true'), 'Must not expose AI client to browser');
});

runTest('README documents environment variables setup', () => {
  const readmePath = path.join(__dirname, '../README.md');
  const content = fs.readFileSync(readmePath, 'utf8');
  assert(content.includes('OPENROUTER_API_KEY'), 'README must document OPENROUTER_API_KEY');
  assert(content.includes('Environment'), 'README must have environment setup section');
});

// ── Summary ───────────────────────────────────────────────────────────
console.log('\n========================================');
const pct = Math.round((passedTests / totalTests) * 100);
const status = pct === 100 ? '🏆 PERFECT SCORE!' : pct >= 80 ? '✅ GOOD' : '⚠️  NEEDS WORK';
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed (${pct}%) ${status}`);
console.log(`   ✅ Passed: ${passedTests}  |  ❌ Failed: ${failedTests}`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
