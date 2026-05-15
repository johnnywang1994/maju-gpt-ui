import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

const envMaxTokens =
  Number(process.env.NEXT_PUBLIC_OPENAI_OPTION_MAX_TOKENS) || 512;

const maxMessages = Number(process.env.NEXT_PUBLIC_OPENAI_MAX_MESSAGES) || 8;

export async function sendResponsesSearch(options: SendResponsesOptions) {
  const { messages, model, maxTokens, enableWebSearch, temperature } = options;

  const response = await openai.responses.create({
    model,
    input: messages.slice(-maxMessages) as any,
    max_output_tokens: Math.min(envMaxTokens, maxTokens),
    ...(temperature !== undefined ? { temperature } : {}),
    ...(enableWebSearch ? { tools: [{ type: "web_search_preview" }] } : {}),
  });

  // Normalize Responses API output to chat completion format
  const messageOutput = response.output.find((item) => item.type === 'message') as any;
  const textContent = messageOutput?.content?.find((c: any) => c.type === 'output_text');

  return {
    id: response.id,
    object: 'chat.completion',
    created: response.created_at,
    model: response.model,
    choices: [
      {
        finish_reason: 'stop',
        index: 0,
        logprobs: null,
        message: {
          role: 'assistant',
          content: textContent?.text ?? '',
        },
      },
    ],
  };
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
  // Normalize: new GPT Image models return b64_json instead of url
  const data = imageGeneratedRes.data?.map(item => ({
    ...item,
    url: item.url ?? (item.b64_json ? `data:image/png;base64,${item.b64_json}` : undefined),
  }));
  return { ...imageGeneratedRes, data };
}

interface Message {
  role: string; // 'user' | 'developer' | 'assistant'
  content: string;
}

interface SendImageGenerateOptions {
  prompt: string;
  model: string;
  size: string;
}

export interface SendResponsesOptions {
  messages: Message[];
  maxTokens: number;
  model: string;
  enableWebSearch?: boolean;
  temperature?: number;
}