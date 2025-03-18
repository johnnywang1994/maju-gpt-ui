import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default openai;

const envMaxTokens =
  Number(process.env.NEXT_PUBLIC_OPENAI_OPTION_MAX_TOKENS) || 512;

const maxMessages = Number(process.env.NEXT_PUBLIC_OPENAI_MAX_MESSAGES) || 8;

const webSearchModels = new Set(['gpt-4o-mini-search-preview', 'gpt-4o-search-preview']);

export async function sendUserCompletions(options: SendCompletionOptions) {
  const {
    messages,
    temperature,
    maxTokens,
    provider,
    model,
    frequencyPenalty,
    presencePenalty,
  } = options;
  const isSearchModel = webSearchModels.has(model);
  const handler = provider === "deepseek" ? deepseek : openai;

  const chatCompletion = await handler.chat.completions.create({
    messages: messages.slice(-maxMessages) as any,
    model,
    max_completion_tokens: Math.min(envMaxTokens, maxTokens),
    // search model params has some different
    ...(isSearchModel ? {
      web_search_options: {
        search_context_size: 'medium',
      },
    } : {
      temperature,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
    }),
  });
  return chatCompletion;
}

export async function sendImageGenerate(options: SendImageGenerateOptions) {
  const {
    prompt,
    model,
    size,
  } = options;
  const imageGeneratedRes = await openai.images.generate({
    prompt,
    model,
    n: 1,
    size: size as any,
  });
  return imageGeneratedRes;
}

interface Message {
  role: string; // 'user' | 'developer' | 'assistant'
  content: string;
}

export interface SendCompletionOptions {
  provider: string; // 'openai' | 'deepseek'
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
  size: string;
}