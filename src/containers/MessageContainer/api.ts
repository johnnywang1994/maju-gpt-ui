"use client";
import { SendMessage } from "@/types/message";
import { snakifyKeys } from "@/lib/common";
import { PageTab, ModelProvider } from "@/hooks/useCommon";

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
}

export async function sendUserCompletions(
  options: SendUserCompletionsOptions,
  apiKey?: string
) {
  let res: any;
  try {
    if (apiKey) {
      const provider = options.provider;
      delete options["provider"];
      delete options["token"];
      const baseURL = provider === ModelProvider.DeepSeek ? "https://api.deepseek.com" : "https://api.openai.com";
      res = await fetch(`${baseURL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(snakifyKeys(options)),
      });
    } else {
      res = await fetch("/api/completions", {
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