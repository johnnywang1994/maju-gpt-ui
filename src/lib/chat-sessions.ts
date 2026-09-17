import type { Message } from "@ag-ui/core";

export const CHAT_SESSIONS_KEY = "maju-chat-sessions";
export const ACTIVE_CHAT_SESSION_KEY = "maju-active-chat-session";
const MAX_MESSAGES_PER_SESSION = 100;

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function storedContent(message: Message): string | null {
  if (typeof message.content === "string") return message.content;
  if (message.role !== "user" || !Array.isArray(message.content)) return null;

  const text = message.content
    .filter((part): part is { type: "text"; text: string } => (
      typeof part === "object" && part !== null && part.type === "text" && typeof part.text === "string"
    ))
    .map((part) => part.text)
    .join("\n");
  const hasImage = message.content.some((part) => typeof part === "object" && part !== null && part.type === "image");
  return hasImage ? [text, "[Image attached]"].filter(Boolean).join("\n") : text;
}

function toStoredMessages(messages: Message[]): StoredMessage[] {
  return messages.flatMap((message): StoredMessage[] => {
    const content = storedContent(message);
    return (message.role === "user" || message.role === "assistant") && typeof message.id === "string" && content !== null
      ? [{ id: message.id, role: message.role, content }]
      : [];
  }).slice(-MAX_MESSAGES_PER_SESSION);
}

export function createChatSession(): ChatSession {
  const now = Date.now();
  return { id: crypto.randomUUID(), title: "新對話", createdAt: now, updatedAt: now, messages: [] };
}

export function readChatSessions(): ChatSession[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CHAT_SESSIONS_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];

    return value.flatMap((session): ChatSession[] => {
      if (
        typeof session !== "object" || session === null
        || typeof session.id !== "string" || typeof session.title !== "string"
        || typeof session.createdAt !== "number" || typeof session.updatedAt !== "number"
        || !Array.isArray(session.messages)
      ) return [];

      return [{ ...session, messages: toStoredMessages(session.messages as Message[]) }];
    });
  } catch {
    return [];
  }
}

export function writeChatSessions(sessions: ChatSession[]): void {
  localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessionTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user" && typeof message.content === "string");
  return typeof firstUserMessage?.content === "string"
    ? firstUserMessage.content.trim().slice(0, 32) || "新對話"
    : "新對話";
}

export function normalizeMessages(messages: Message[]): Message[] {
  return toStoredMessages(messages);
}
