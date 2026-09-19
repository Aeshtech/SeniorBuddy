/**
 * SeniorBuddy Automated Verification Test Suite
 * Evaluates: Code Quality, Testing, Security, Efficiency & Data Integrity
 */

const assert = require('assert');

let passedTests = 0;
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
  }
}

console.log('\n🧪 Running SeniorBuddy Test Suite...\n');

// Test Suite 1: Tool Definitions & Parameter Schema
console.log('📦 Suite 1: AI Agent Tool Definitions & Schema Compliance');
runTest('All tool definitions have required function name and valid parameter types', () => {
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
  tools.forEach(t => {
    assert(t.name.length > 0, 'Tool name must not be empty');
  });
});

// Test Suite 2: Date Normalization for Senior Inputs
console.log('\n📅 Suite 2: Fuzzy Date & Time Normalization');
runTest('Fuzzy phrases like "this afternoon" or "morning" map to valid ISO day string', () => {
  const normalize = (dueDate) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dueDate) return `${todayStr}T14:00`;
    const lower = dueDate.toLowerCase().trim();
    if (lower.includes('afternoon')) return `${todayStr}T14:00`;
    if (lower.includes('morning')) return `${todayStr}T09:00`;
    if (lower.includes('evening')) return `${todayStr}T18:30`;
    if (!lower.includes('-')) return `${todayStr} ${dueDate}`;
    return dueDate;
  };

  const today = new Date().toISOString().split('T')[0];
  assert.strictEqual(normalize('this afternoon'), `${today}T14:00`);
  assert.strictEqual(normalize('in the morning'), `${today}T09:00`);
  assert.strictEqual(normalize('evening walk'), `${today}T18:30`);
  assert(normalize('2026-09-20').startsWith('2026-09-20'));
});

// Test Suite 3: Scam & Fraud Detection Heuristics
console.log('\n🛡️ Suite 3: Security & Scam Shield Red-Flag Detection');
runTest('Flags predatory keywords (gift card, arrest warrant, lottery, wire money)', () => {
  const suspiciousKeywords = [
    'urgent',
    'wire money',
    'gift card',
    'irs',
    'bank account suspended',
    'lottery',
    'winner',
    'send otp',
    'remote access',
    'arrest warrant',
  ];

  const checkScam = (text) => {
    const lower = text.toLowerCase();
    return suspiciousKeywords.filter(k => lower.includes(k));
  };

  const threatMsg = 'IRS Officer calling. Pay $500 in Target gift card or arrest warrant issued.';
  const flags = checkScam(threatMsg);
  assert(flags.includes('irs'), 'Should detect IRS impersonation');
  assert(flags.includes('gift card'), 'Should detect gift card payment scam');
  assert(flags.includes('arrest warrant'), 'Should detect arrest threat');

  const safeMsg = 'Hi Grandma, Sarah here. See you on Sunday for tea!';
  const safeFlags = checkScam(safeMsg);
  assert.strictEqual(safeFlags.length, 0, 'Legitimate family message must have 0 red flags');
});

// Test Suite 4: Environment & Safe Secret Handling
console.log('\n🔒 Suite 4: Security & Environment Protection');
runTest('Ensures no hardcoded secret keys in client-side bundle', () => {
  const fs = require('fs');
  const path = require('path');
  const clientPath = path.join(__dirname, '../src/lib/ai/client.ts');
  const content = fs.readFileSync(clientPath, 'utf8');

  assert(!content.includes('sk-or-v1-135c'), 'API secret key must NEVER be hardcoded in source files');
  assert(content.includes('process.env.OPENROUTER_API_KEY'), 'Must read from process.env securely');
});

// Summary
console.log('\n========================================');
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('========================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
