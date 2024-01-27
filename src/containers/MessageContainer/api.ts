"use client";
import { SendMessage } from "@/types/message";
import { snakifyKeys } from "@/lib/common";

interface SendOptions {
  messages: SendMessage[];
  temperature: number;
  token?: string;
  maxTokens?: number;
  model?: string;
  // https://platform.openai.com/docs/guides/text-generation/parameter-details
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export async function sendUserCompletions(
  options: SendOptions,
  apiKey?: string
) {
  let res: any;
  try {
    if (apiKey) {
      delete options["token"];
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(snakifyKeys(options)),
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
