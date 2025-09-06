import { sendImageGenerate } from "@/server/openai";
import { sendImageGenerate as sendGeminiImageGenerate } from "@/server/gemini";
import { verifyAccessToken, channelId } from "@/server/line";
import { success, failed } from "@/server/response";
import { ModelProvider } from "@/types/model";

const enableAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

export const dynamic = "force-dynamic";

const checkAccessToken = async (token: string) => {
  const res = await verifyAccessToken(token);
  return res.client_id === channelId;
};

const getSendMessageHandler = async (provider: string) => {
  switch (provider) {
    case ModelProvider.OpenAI:
      return sendImageGenerate;
    case ModelProvider.Gemini:
      return sendGeminiImageGenerate;
    default:
      return sendImageGenerate;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      provider,
      model,
      size,
      token,
    } = body;
    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = await checkAccessToken(token);
      if (!isValid) return failed(403);
    }
    const handler = await getSendMessageHandler(provider)
    const result = await handler({
      prompt,
      model,
      size,
    });
    return success(result);
  } catch (err) {
    console.error(err);
    return failed(500);
  }
}
