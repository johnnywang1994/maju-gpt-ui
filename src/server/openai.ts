import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

const envMaxTokens =
  Number(process.env.NEXT_PUBLIC_OPENAI_OPTION_MAX_TOKENS) || 512;

const maxMessages = Number(process.env.NEXT_PUBLIC_OPENAI_MAX_MESSAGES) || 8;

export async function sendUserCompletions(options: SendCompletionOptions) {
  const {
    messages,
    temperature,
    maxTokens,
    model,
    frequencyPenalty,
    presencePenalty,
  } = options;
  const chatCompletion = await openai.chat.completions.create({
    messages: messages.slice(-maxMessages) as any,
    model,
    max_tokens: Math.min(envMaxTokens, maxTokens),
    temperature,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  });
  return chatCompletion;
}

export async function sendImageGenerate(options: SendImageGenerateOptions) {
  const {
    prompt,
    model,
  } = options;
  const imageGeneratedRes = await openai.images.generate({
    prompt,
    model,
    n: 1,
    size: '1024x1024',
  });
  return imageGeneratedRes;
}

interface Message {
  role: string; // 'user' | 'system' | 'assistant'
  content: string;
}

interface SendCompletionOptions {
  messages: Message[];
  temperature: number;
  maxTokens: number;
  model: string;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface SendImageGenerateOptions {
  prompt: string;
  model: string;
}