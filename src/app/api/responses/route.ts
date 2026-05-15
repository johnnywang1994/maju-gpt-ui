import { sendResponsesSearch } from "@/server/openai";
import { sendGenerateContent } from "@/server/gemini";
import { verifyAccessToken, channelId } from "@/server/line";
import { success, failed } from "@/server/response";
import { random } from "@/lib/random";
import { RoleType } from "@/types/message";
import { ModelProvider } from "@/types/model";

const enableAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

export const dynamic = "force-dynamic";

const checkAccessToken = async (token: string) => {
  const res = await verifyAccessToken(token);
  return res.client_id === channelId;
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
      enableWebSearch,
    } = body;

    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = await checkAccessToken(token);
      if (!isValid) return failed(403);
    }

    let result: any;
    if (provider === ModelProvider.Gemini) {
      const content = await sendGenerateContent({
        model,
        prompt: messages[messages.length - 1].content,
        temperature,
        maxTokens,
        enableWebSearch,
      });
      result = {
        id: `gemini-${random()}`,
        object: 'chat.completion',
        created: Math.round(Date.now() / 1000),
        model,
        choices: [{
          finish_reason: "stop",
          index: 0,
          logprobs: null,
          message: { role: RoleType.GPT, content },
        }],
      };
    } else {
      result = await sendResponsesSearch({ messages, maxTokens, model, enableWebSearch, temperature });
    }

    return success(result);
  } catch (err) {
    console.error(err);
    return failed(500);
  }
}
