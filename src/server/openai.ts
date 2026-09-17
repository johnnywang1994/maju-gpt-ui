import OpenAI from "openai";
import env from "@/lib/env/server";

export function getOpenAIClient(): OpenAI {
  const apiKey = env.OPENAI_API_KEY?.trim();
  const baseURL = env.OPENAI_BASE_URL?.trim();

  if (!apiKey || !baseURL) {
    throw new Error("OPENAI_API_KEY and OPENAI_BASE_URL must be configured");
  }

  let url: URL;
  try {
    url = new URL(baseURL);
  } catch {
    throw new Error("OPENAI_BASE_URL must be a valid HTTP(S) URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("OPENAI_BASE_URL must be a valid HTTP(S) URL");
  }

  return new OpenAI({ apiKey, baseURL: url.toString() });
}
