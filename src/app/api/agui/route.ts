import type { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import sharp from "sharp";
import clientEnv from "@/lib/env/client";
import { isAllowedImageModel, isAllowedModel } from "@/lib/models";
import { getOpenAIClient } from "@/server/openai";
import { channelId, verifyAccessToken } from "@/server/line";
import env from "@/lib/env/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AgentMessage = {
  id?: unknown;
  role?: unknown;
  content?: unknown;
};

type ChatOptions = {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
};

type ImageGeneration = {
  dataUrl: string;
  revisedPrompt?: string;
};

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_BASE64_LENGTH = Math.ceil(MAX_IMAGE_SIZE_BYTES / 3) * 4;
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_GENERATED_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_GENERATED_IMAGE_BASE64_LENGTH = Math.ceil(MAX_GENERATED_IMAGE_SIZE_BYTES / 3) * 4;
const IMAGE_GENERATION_TIMEOUT_MS = 60_000;

class InvalidImagePayloadError extends Error {}

function sse(value: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);
}

async function isAuthorized(request: Request): Promise<boolean> {
  if (!clientEnv.NEXT_PUBLIC_ENABLE_AUTH) return true;

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !channelId) return false;
  const verified = await verifyAccessToken(token);
  return verified.client_id === channelId;
}

async function validateImageData(mimeType: unknown, value: unknown): Promise<string> {
  if (typeof mimeType !== "string" || !IMAGE_MIME_TYPES.has(mimeType) || typeof value !== "string") {
    throw new InvalidImagePayloadError("Unsupported image payload");
  }
  if (value.length === 0 || value.length > MAX_IMAGE_BASE64_LENGTH || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new InvalidImagePayloadError("Malformed image payload");
  }

  const image = Buffer.from(value, "base64");
  if (image.length === 0 || image.length > MAX_IMAGE_SIZE_BYTES || image.toString("base64") !== value) {
    throw new InvalidImagePayloadError("Malformed image payload");
  }
  try {
    // Decode and re-encode to reject truncated images and strip trailing payloads.
    const sharpOptions = { failOn: "error" as const, limitInputPixels: 40_000_000 };
    const metadata = await sharp(image, sharpOptions).metadata();
    const expectedFormat = mimeType.replace("image/", "").replace("jpeg", "jpg");
    const detectedFormat = metadata.format?.replace("jpeg", "jpg");
    if (!metadata.width || !metadata.height || detectedFormat !== expectedFormat) {
      throw new InvalidImagePayloadError("Unsupported image payload");
    }
    const normalizedImage = await sharp(image, sharpOptions).toBuffer();
    if (normalizedImage.length === 0 || normalizedImage.length > MAX_IMAGE_SIZE_BYTES) {
      throw new InvalidImagePayloadError("Image exceeds size limit");
    }
    return `data:${mimeType};base64,${normalizedImage.toString("base64")}`;
  } catch (error) {
    if (error instanceof InvalidImagePayloadError) throw error;
    throw new InvalidImagePayloadError("Malformed image payload");
  }
}

async function toChatMessages(messages: unknown, maximumMessages: number): Promise<{ messages: ChatCompletionMessageParam[]; hasImage: boolean }> {
  if (!Array.isArray(messages)) throw new InvalidImagePayloadError("Malformed messages");

  let imageCount = 0;
  const parsed: ChatCompletionMessageParam[] = [];
  for (const message of messages.slice(-maximumMessages) as AgentMessage[]) {
    const role = String(message?.role);
    if (!["system", "developer", "user", "assistant"].includes(role)) continue;
    if (typeof message.content === "string") {
      parsed.push({ role: role as "system" | "developer" | "user" | "assistant", content: message.content });
      continue;
    }
    if (!Array.isArray(message.content)) continue;
    if (role !== "user") throw new InvalidImagePayloadError("Only user messages may contain attachments");

    const content: ChatCompletionContentPart[] = [];
    for (const part of message.content) {
      if (typeof part !== "object" || part === null) throw new InvalidImagePayloadError("Malformed message content");
      const input = part as Record<string, unknown>;
      if (input.type === "text" && typeof input.text === "string") {
        content.push({ type: "text", text: input.text });
        continue;
      }
      if (input.type !== "image" || typeof input.source !== "object" || input.source === null) {
        throw new InvalidImagePayloadError("Unsupported message content");
      }
      if (++imageCount > 1) throw new InvalidImagePayloadError("Only one image is allowed");
      const source = input.source as Record<string, unknown>;
      if (source.type !== "data") throw new InvalidImagePayloadError("Unsupported image source");
      content.push({ type: "image_url", image_url: { url: await validateImageData(source.mimeType, source.value) } });
    }
    if (content.length === 0) throw new InvalidImagePayloadError("Message content is empty");
    parsed.push({ role: "user", content });
  }

  return { messages: parsed, hasImage: imageCount > 0 };
}

function getImagePrompt(messages: unknown): string {
  if (!Array.isArray(messages)) throw new InvalidImagePayloadError("A user prompt is required");
  const message = messages.at(-1) as AgentMessage | undefined;
  if (Array.isArray(message?.content)) throw new InvalidImagePayloadError("Attachments are not supported for image generation");
  if (message?.role !== "user" || typeof message.content !== "string") throw new InvalidImagePayloadError("A user prompt is required");
  const prompt = message.content.trim();
  if (!prompt || prompt.length > 4000) throw new InvalidImagePayloadError("A user prompt is required");
  return prompt;
}

async function validateGeneratedImage(value: unknown): Promise<string> {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_GENERATED_IMAGE_BASE64_LENGTH || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new InvalidImagePayloadError("Malformed image response");
  }
  const image = Buffer.from(value, "base64");
  if (image.length === 0 || image.length > MAX_GENERATED_IMAGE_SIZE_BYTES || image.toString("base64") !== value) throw new InvalidImagePayloadError("Malformed image response");
  try {
    const sharpOptions = { failOn: "error" as const, limitInputPixels: 40_000_000 };
    const metadata = await sharp(image, sharpOptions).metadata();
    const format = metadata.format === "jpeg" ? "jpeg" : metadata.format;
    if (!metadata.width || !metadata.height || !format || !["jpeg", "png", "webp"].includes(format)) throw new InvalidImagePayloadError("Unsupported image response");
    const normalized = await sharp(image, sharpOptions).toFormat(format).toBuffer();
    if (normalized.length === 0 || normalized.length > MAX_GENERATED_IMAGE_SIZE_BYTES) throw new InvalidImagePayloadError("Image exceeds size limit");
    return `data:image/${format};base64,${normalized.toString("base64")}`;
  } catch (error) {
    if (error instanceof InvalidImagePayloadError) throw error;
    throw new InvalidImagePayloadError("Malformed image response");
  }
}

async function generateImage(model: string, prompt: string): Promise<ImageGeneration> {
  const apiKey = env.OPENAI_IMAGE_API_KEY?.trim() || env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("Image API key is not configured");
  const response = await fetch(env.OPENAI_IMAGE_GENERATIONS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, n: 1, response_format: "b64_json" }),
    signal: AbortSignal.timeout(IMAGE_GENERATION_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("Image generation failed");
  const payload: unknown = await response.json();
  if (typeof payload !== "object" || payload === null || !Array.isArray((payload as { data?: unknown }).data) || (payload as { data: unknown[] }).data.length !== 1) throw new InvalidImagePayloadError("Malformed image response");
  const image = (payload as { data: unknown[] }).data[0];
  if (typeof image !== "object" || image === null) throw new InvalidImagePayloadError("Malformed image response");
  const revisedPrompt = (image as { revised_prompt?: unknown }).revised_prompt;
  return {
    dataUrl: await validateGeneratedImage((image as { b64_json?: unknown }).b64_json),
    ...(typeof revisedPrompt === "string" && revisedPrompt.length <= 4000 ? { revisedPrompt } : {}),
  };
}

function numberInRange(value: unknown, fallback: number, minimum: number, maximum: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function getChatOptions(value: unknown): ChatOptions {
  const properties = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  return {
    temperature: numberInRange(properties.temperature, 0.7, 0, 2),
    maxTokens: Math.floor(numberInRange(properties.maxTokens, 1024, 1, 4096)),
    systemPrompt: typeof properties.systemPrompt === "string" ? properties.systemPrompt.trim().slice(0, 4000) : "",
  };
}

export async function GET() {
  return Response.json({
    version: "0.1.0",
    mode: "sse",
    telemetryDisabled: true,
    inspectorMetadata: false,
    agents: { "maju-chat": { description: "Maju text chat", capabilities: {} } },
  });
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "Authentication is required" }, { status: 401 });
  }

  const requestBody = await request.json() as Record<string, unknown>;
  if (requestBody.method === "info") return GET();
  if (
    (requestBody.method !== "agent/run" && requestBody.method !== "agent/connect")
    || typeof requestBody.params !== "object"
    || requestBody.params === null
    || (requestBody.params as Record<string, unknown>).agentId !== "maju-chat"
    || typeof requestBody.body !== "object"
    || requestBody.body === null
    || Array.isArray(requestBody.body)
  ) {
    return Response.json({ error: "Invalid AG-UI request" }, { status: 422 });
  }

  const body = requestBody.body as Record<string, unknown>;
  if (requestBody.method === "agent/connect") {
    // CopilotKit opens this stream to synchronize a session before its first run.
    return new Response(new ReadableStream({ start: (controller) => controller.close() }), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  }

  const threadId = typeof body.threadId === "string" ? body.threadId : crypto.randomUUID();
  const runId = typeof body.runId === "string" ? body.runId : crypto.randomUUID();
  const model = (body.forwardedProps as Record<string, unknown> | undefined)?.model;
  const selectedModel = typeof model === "string" ? model : env.OPENAI_MODEL;
  const forwardedProps = body.forwardedProps as Record<string, unknown> | undefined;
  const imageMode = forwardedProps?.mode === "image";
  const imageModel = typeof forwardedProps?.imageModel === "string" ? forwardedProps.imageModel : "";
  const options = getChatOptions(body.forwardedProps);
  if (imageMode) {
    let prompt: string | undefined;
    try {
      prompt = getImagePrompt(body.messages);
    } catch {}

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(sse({ type: "RUN_STARTED", threadId, runId }));
        try {
          if (!prompt || !imageModel || !isAllowedImageModel(imageModel)) throw new Error("Invalid image generation request");
          const generated = await generateImage(imageModel, prompt);
          controller.enqueue(sse({ type: "CUSTOM", name: "maju.image.generated", value: { version: 1, threadId, runId, model: imageModel, prompt, dataUrl: generated.dataUrl, ...(generated.revisedPrompt ? { revisedPrompt: generated.revisedPrompt } : {}) } }));
          controller.enqueue(sse({ type: "RUN_FINISHED", threadId, runId }));
        } catch {
          controller.enqueue(sse({ type: "RUN_ERROR", message: "Unable to process request", code: "REQUEST_FAILED" }));
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: { "Cache-Control": "no-store", "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive" } });
  }
  let parsedMessages: { messages: ChatCompletionMessageParam[]; hasImage: boolean };
  try {
    parsedMessages = await toChatMessages(body.messages, options.systemPrompt ? 9 : 10);
  } catch (error) {
    if (error instanceof InvalidImagePayloadError) return Response.json({ error: "Invalid image attachment" }, { status: 422 });
    throw error;
  }
  const messages = parsedMessages.messages;

  if (!selectedModel || !isAllowedModel(selectedModel)) {
    return Response.json({ error: "The selected model is not available" }, { status: 400 });
  }
  if (parsedMessages.hasImage && !env.OPENAI_VISION_MODELS?.split(",").map((model) => model.trim()).includes(selectedModel)) {
    return Response.json({ error: "The selected model does not support image attachments" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const messageId = crypto.randomUUID();
      controller.enqueue(sse({ type: "RUN_STARTED", threadId, runId }));

      try {
        if (!messages.some((message) => message.role === "user")) {
          throw new Error("A user message is required");
        }

        controller.enqueue(sse({ type: "TEXT_MESSAGE_START", messageId, role: "assistant" }));
        const completion = await getOpenAIClient().chat.completions.create({
          model: selectedModel,
          messages: options.systemPrompt ? [{ role: "system", content: options.systemPrompt }, ...messages] : messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta.content;
          if (delta) controller.enqueue(sse({ type: "TEXT_MESSAGE_CONTENT", messageId, delta }));
        }

        controller.enqueue(sse({ type: "TEXT_MESSAGE_END", messageId }));
        controller.enqueue(sse({ type: "RUN_FINISHED", threadId, runId }));
      } catch (error) {
        console.error("AG-UI chat request failed");
        controller.enqueue(sse({ type: "TEXT_MESSAGE_END", messageId }));
        controller.enqueue(sse({ type: "RUN_ERROR", message: "Unable to process request", code: "REQUEST_FAILED" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
    },
  });
}
