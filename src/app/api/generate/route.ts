import { sendUserCompletions } from "@/server/openai";
import { verifyAccessToken, channelId } from "@/server/line";
import { success, failed } from "@/server/response";

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
      token,
      temperature,
      maxTokens,
      model,
      frequencyPenalty,
      presencePenalty,
    } = body;
    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = checkAccessToken(token);
      if (!isValid) return failed(403);
    }
    const result = await sendUserCompletions({
      messages,
      temperature,
      maxTokens,
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
