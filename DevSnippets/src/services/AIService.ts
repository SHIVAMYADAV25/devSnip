import * as SecureStore from 'expo-secure-store';
import type { AIAction, AIProvider } from '../types';

const KEYS = {
  gemini: 'gemini_api_key',
  openai: 'openai_api_key',
  claude: 'claude_api_key',
  provider: 'ai_provider',
};

export async function saveApiKey(provider: AIProvider, key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS[provider], key);
}

export async function getApiKey(provider: AIProvider): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS[provider]);
}

export async function deleteApiKey(provider: AIProvider): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS[provider]);
}

export async function saveProvider(provider: AIProvider): Promise<void> {
  await SecureStore.setItemAsync(KEYS.provider, provider);
}

export async function getSavedProvider(): Promise<AIProvider> {
  const p = await SecureStore.getItemAsync(KEYS.provider);
  return (p as AIProvider) ?? 'gemini';
}

function buildPrompt(action: AIAction, code: string, language: string): string {
  const header = `Language: ${language}\n\nCode:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n\n`;
  switch (action) {
    case 'explain':
      return `${header}Please explain this code line by line. Break down what each part does, explain the logic flow, and mention any important concepts or patterns used. Format your response with clear sections: Overview, How It Works (step by step), and Key Concepts.`;
    case 'summarize':
      return `${header}Provide a concise summary of this code. In 3-5 sentences, explain what it does, its purpose, inputs/outputs, and when you'd use it.`;
    case 'improve':
      return `${header}Review this code and suggest specific improvements. Cover: performance optimizations, best practices, error handling, readability, and any potential bugs. Format as a numbered list with short code examples where helpful.`;
  }
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response received.';
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    }),
  });
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response received.';
}

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text ?? 'No response received.';
}

export async function runAIAction(
  action: AIAction,
  code: string,
  language: string,
  provider: AIProvider
): Promise<string> {
  const apiKey = await getApiKey(provider);
  if (!apiKey) throw new Error(`No API key configured for ${provider}`);

  const prompt = buildPrompt(action, code, language);

  switch (provider) {
    case 'gemini':
      return await callGemini(apiKey, prompt);
    case 'openai':
      return await callOpenAI(apiKey, prompt);
    case 'claude':
      return await callClaude(apiKey, prompt);
    default:
      throw new Error('Unknown AI provider');
  }
}

export async function hasApiKey(provider: AIProvider): Promise<boolean> {
  const key = await getApiKey(provider);
  return !!key && key.trim().length > 0;
}
