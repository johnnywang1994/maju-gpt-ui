export const ENABLE_AUTH = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

export const MAX_TOKENS =
  Number(process.env.NEXT_PUBLIC_OPENAI_OPTION_MAX_TOKENS) || 512;

// this is the total messages number to send to OpenAI
// includes system, user, assistant
export const MAX_MESSAGES =
  Number(process.env.NEXT_PUBLIC_OPENAI_MAX_MESSAGES) || 4;
