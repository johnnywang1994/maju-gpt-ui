import { sendUserCompletions, SendCompletionOptions } from "@/server/openai";
import { sendGenerateContent } from "@/server/gemini";
import { verifyAccessToken, channelId } from "@/server/line";
import { success, failed } from "@/server/response";
import { random } from "@/lib/random";
import { RoleType } from "@/types/message";

const enableAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

export const dynamic = "force-dynamic";

const checkAccessToken = async (token: string) => {
  const res = await verifyAccessToken(token);
  return res.client_id === channelId;
};

// mock gemini response as openai response
const wrapGeminiGenerate = async (options: SendCompletionOptions) => {
  const content = await sendGenerateContent({
    model: options.model,
    // last message here is the prompt
    prompt: options.messages[options.messages.length - 1].content,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  });
  return {
    id: `gemini-${random()}`,
    object: 'chat.completion',
    created: Math.round(Date.now() / 1000),
    model: options.model,
    choices: [
      {
        finish_reason: "stop",
        index: 0,
        logprobs: null,
        message: {
          role: RoleType.GPT,
          content,
        },
      },
    ],
  };
};

// openai, deepseek, gemini
const getSendMessageHandler = async (provider: string) => {
  switch (provider) {
    case "openai":
      return sendUserCompletions;
    case "deepseek":
      return sendUserCompletions;
    case "gemini":
      return wrapGeminiGenerate;
    default:
      return sendUserCompletions;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      provider,
      token,
      temperature,
      maxTokens,
      model,
      frequencyPenalty,
      presencePenalty,
    } = body;
    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = await checkAccessToken(token);
      if (!isValid) return failed(403);
    }
    const sendHandler = await getSendMessageHandler(provider);
    const result = await sendHandler({
      messages,
      temperature,
      maxTokens,
      provider,
      model,
      frequencyPenalty,
      presencePenalty,
    });
    return success(result);
  } catch (err) {
    console.error(err);
    return failed(500);
  }
}
