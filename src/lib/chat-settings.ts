import clientEnv from "@/lib/env/client";

export const CHAT_SETTINGS_KEY = "maju-chat-settings";

export const DEFAULT_SYSTEM_PROMPT =
  clientEnv.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT?.trim() ||
  "你是一位友善的 AI 助理，名為 Maju。請使用繁體中文回覆，保持清楚與禮貌。目前時間是 {currentTime}。";

export type ChatSettings = {
  mode: "chat" | "image";
  imageModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  enableWebSearch: boolean;
};

export const defaultChatSettings: ChatSettings = {
  mode: "chat",
  imageModel: "",
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  enableWebSearch: true,
};

export function readChatSettings(): ChatSettings {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CHAT_SETTINGS_KEY) ?? "{}");
    if (typeof value !== "object" || value === null) return defaultChatSettings;
    const settings = value as Partial<ChatSettings>;
    return {
      mode: settings.mode === "image" ? "image" : "chat",
      imageModel: typeof settings.imageModel === "string" ? settings.imageModel : defaultChatSettings.imageModel,
      temperature: typeof settings.temperature === "number" ? settings.temperature : defaultChatSettings.temperature,
      maxTokens: typeof settings.maxTokens === "number" ? settings.maxTokens : defaultChatSettings.maxTokens,
      systemPrompt: typeof settings.systemPrompt === "string" ? settings.systemPrompt : defaultChatSettings.systemPrompt,
      enableWebSearch: typeof settings.enableWebSearch === "boolean" ? settings.enableWebSearch : defaultChatSettings.enableWebSearch,
    };
  } catch {
    return defaultChatSettings;
  }
}
