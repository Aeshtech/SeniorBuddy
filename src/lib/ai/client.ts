import OpenAI from 'openai';

const apiKey =
  process.env.OPENROUTER_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';

const baseURL =
  process.env.OPENROUTER_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'https://openrouter.ai/api/v1';

export const AI_MODEL =
  process.env.OPENROUTER_MODEL ||
  process.env.OPENAI_MODEL ||
  'google/gemini-2.5-flash';

export const aiClient = new OpenAI({
  apiKey,
  baseURL,
  defaultHeaders: {
    'HTTP-Referer': 'https://senior-buddy.vercel.app',
    'X-Title': 'SeniorBuddy',
  },
});
