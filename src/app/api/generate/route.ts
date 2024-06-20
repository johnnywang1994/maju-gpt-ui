import { sendImageGenerate } from "@/server/openai";
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
      prompt,
      model,
      size,
      token,
    } = body;
    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = await checkAccessToken(token);
      if (!isValid) return failed(403);
    }
    const result = await sendImageGenerate({
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
