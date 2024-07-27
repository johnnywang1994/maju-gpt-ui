import { sendGenerateContent } from "@/server/gemini";
import { success, failed } from "@/server/response";

const enableAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

const geminiAuthToken = process.env.GEMINI_API_AUTH_TOKEN;

export const dynamic = "force-dynamic";

const checkAccessToken = (token: string) => {
  return token === geminiAuthToken;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      token,
      prompt,
      temperature,
      maxTokens,
    } = body;
    if (enableAuth) {
      if (!token) return failed(400);
      const isValid = checkAccessToken(token);
      if (!isValid) return failed(403);
    }
    const result = await sendGenerateContent({
      prompt,
      temperature,
      maxTokens,
    });
    return success({
      result,
    });
  } catch (err) {
    console.error(err);
    return failed(500);
  }
}
