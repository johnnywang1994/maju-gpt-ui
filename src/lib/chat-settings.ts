export const CHAT_SETTINGS_KEY = "maju-chat-settings";

export type ChatSettings = {
  mode: "chat" | "image";
  imageModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
};

export const defaultChatSettings: ChatSettings = {
  mode: "chat",
  imageModel: "",
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: "",
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
    };
  } catch {
    return defaultChatSettings;
  }
}
