import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

export async function sendGenerateContent(options: SendGenerateContentOptions) {
  if (!API_KEY) {
    throw Error('env "GEMINI_API_KEY" is not set');
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: options?.model ?? "gemini-2.0-flash",
    // systemInstruction: "You are a software engineer who is trying to debug a piece of code.",
    generationConfig: {
      maxOutputTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 0.7,
    },
  });

  const result = await model.generateContent(options.prompt);
  const response = result.response;
  const text = response.text();
  return text;
}

interface SendGenerateContentOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}