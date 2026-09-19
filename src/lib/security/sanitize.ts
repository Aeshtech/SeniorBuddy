/**
 * SeniorBuddy Input Sanitization & Security Middleware
 * Provides centralized validation, sanitization, and rate limiting
 * for all API endpoints to prevent injection, abuse, and data corruption.
 */

// ── Constants ─────────────────────────────────────────────────────────────
const MAX_STRING_LENGTH = 500;
const MAX_AMOUNT = 1_000_000;
const MIN_AMOUNT = 0;

const ALLOWED_BILL_CATEGORIES = new Set([
  'utility', 'medical', 'insurance', 'rent', 'tax', 'subscription', 'other',
]);

const SCAM_KEYWORDS = [
  'urgent', 'wire money', 'gift card', 'irs', 'bank account suspended',
  'lottery', 'winner', 'send otp', 'remote access', 'arrest warrant',
  'verify your account', 'click here immediately', 'social security suspended',
  'congratulations you won', 'your computer is infected', 'send bitcoin',
];

// ── In-memory rate limiter (per IP, resets every minute) ─────────────────
interface RateEntry { count: number; windowStart: number }
const rateLimitStore = new Map<string, RateEntry>();
const RATE_LIMIT_MAX = 30;       // max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  return { allowed: true, retryAfterMs: 0 };
}

// ── String sanitizer ──────────────────────────────────────────────────────
export function sanitizeString(
  value: unknown,
  fieldName: string,
  options: { required?: boolean; maxLength?: number } = {}
): string {
  const { required = false, maxLength = MAX_STRING_LENGTH } = options;

  if (value === null || value === undefined || value === '') {
    if (required) throw new ValidationError(`"${fieldName}" is required and must not be empty.`);
    return '';
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`"${fieldName}" must be a string.`);
  }

  // Strip HTML/script tags and trim whitespace
  const sanitized = value
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/[<>'"`;]/g, '')     // strip dangerous chars
    .trim();

  if (sanitized.length > maxLength) {
    throw new ValidationError(`"${fieldName}" exceeds maximum length of ${maxLength} characters.`);
  }

  return sanitized;
}

// ── Number sanitizer ──────────────────────────────────────────────────────
export function sanitizeAmount(value: unknown, fieldName = 'amount'): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError(`"${fieldName}" must be a valid number.`);
  }
  if (num < MIN_AMOUNT || num > MAX_AMOUNT) {
    throw new ValidationError(`"${fieldName}" must be between ${MIN_AMOUNT} and ${MAX_AMOUNT}.`);
  }
  return Math.round(num * 100) / 100; // normalize to 2 decimal places
}

// ── Date sanitizer ────────────────────────────────────────────────────────
export function sanitizeDateString(value: unknown, fieldName = 'dueDate'): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`"${fieldName}" is required and must be a string.`);
  }
  // Accept YYYY-MM-DD or YYYY-MM-DDTHH:mm patterns
  const cleaned = value.trim();
  const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;
  if (!datePattern.test(cleaned)) {
    throw new ValidationError(
      `"${fieldName}" must be in YYYY-MM-DD or YYYY-MM-DDTHH:mm format. Got: "${cleaned}"`
    );
  }
  const parsed = new Date(cleaned);
  if (isNaN(parsed.getTime())) {
    throw new ValidationError(`"${fieldName}" is not a valid date: "${cleaned}"`);
  }
  return cleaned;
}

// ── Category validator ────────────────────────────────────────────────────
export function sanitizeBillCategory(value: unknown): BillCategory {
  if (!value || !ALLOWED_BILL_CATEGORIES.has(value as string)) {
    return 'other';
  }
  return value as BillCategory;
}
type BillCategory = 'utility' | 'medical' | 'insurance' | 'rent' | 'tax' | 'subscription' | 'other';

// ── Scam detection ────────────────────────────────────────────────────────
export interface ScamAnalysis {
  isSuspicious: boolean;
  flags: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export function analyzeForScam(text: string): ScamAnalysis {
  const lower = text.toLowerCase();
  const flags = SCAM_KEYWORDS.filter((kw) => lower.includes(kw));
  const riskLevel =
    flags.length === 0 ? 'low' : flags.length <= 2 ? 'medium' : 'high';
  return { isSuspicious: flags.length > 0, flags, riskLevel };
}

// ── Custom error class ────────────────────────────────────────────────────
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
