"use client";
import { SendMessage } from "@/types/message";
import { snakifyKeys } from "@/lib/common";
import { PageTab } from "@/hooks/useCommon";
import { ModelProvider } from "@/types/model";

interface SendUserCompletionsOptions {
  messages: SendMessage[];
  temperature: number;
  provider?: ModelProvider;
  token?: string;
  maxTokens?: number;
  model?: string;
  // https://platform.openai.com/docs/guides/text-generation/parameter-details
  frequencyPenalty?: number;
  presencePenalty?: number;
  enableWebSearch?: boolean;
}

export async function sendUserCompletions(
  options: SendUserCompletionsOptions,
  apiKey?: string
) {
  let res: any;
  try {
    if (apiKey) {
      delete options["provider"];
      delete options["token"];
      const { messages, maxTokens, frequencyPenalty, presencePenalty, enableWebSearch, ...rest } = options as any;
      res = await fetch(`https://api.openai.com/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(snakifyKeys({
          ...rest,
          input: messages,
          maxOutputTokens: maxTokens,
          ...(enableWebSearch ? { tools: [{ type: 'web_search_preview' }] } : {}),
        })),
      });
      const rawData = await res.json();
      const messageOutput = rawData?.output?.find((item: any) => item.type === 'message');
      const textContent = messageOutput?.content?.find((c: any) => c.type === 'output_text');
      return {
        id: rawData.id,
        object: 'chat.completion',
        created: rawData.created_at,
        model: rawData.model,
        choices: [{
          finish_reason: 'stop',
          index: 0,
          logprobs: null,
          message: {
            role: 'assistant',
            content: textContent?.text ?? '',
          },
        }],
      };
    } else {
      res = await fetch("/api/responses", {
        method: "POST",
        body: JSON.stringify(options),
      });
      const data = await res.json();
      return data;
    }
  } catch {
    return res;
  }
}

interface SendImageGenerateOptions {
  model: string;
  prompt: string;
  size: string;
  token?: string;
}

export async function sendImageGenerate(
  options: SendImageGenerateOptions,
  apiKey?: string
) {
  let res: any;
  try {
    if (apiKey) {
      delete options["token"];
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(snakifyKeys({
          ...options,
          n: 1,
        })),
      });
    } else {
      res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify(options),
      });
    }
    const data = await res.json();
    return data;
  } catch {
    return res;
  }
}

export function sendMessage(tab: PageTab, options: any, apiKey?: string) {
  switch (tab) {
    case PageTab.Chat:
      return sendUserCompletions(options, apiKey);
    case PageTab.Image:
      return sendImageGenerate(options, apiKey);
    default:
      break;
  }
}