"use client";
import { SendMessage } from "@/types/message";

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

export async function sendUserCompletions(options: SendOptions) {
  const res = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify(options),
  });
  try {
    const data = await res.json();
    return data;
  } catch {
    return res;
  }
}
