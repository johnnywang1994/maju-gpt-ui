"use client";

import { useEffect, useState } from "react";
import { useAgent } from "@copilotkit/react-core/v2";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type ImageCard = { runId: string; dataUrl: string; prompt: string; revisedPrompt?: string };

function parseImageEvent(value: unknown, sessionId: string): ImageCard | null {
  if (typeof value !== "object" || value === null) return null;
  const payload = value as Record<string, unknown>;
  if (payload.version !== 1 || payload.threadId !== sessionId || typeof payload.runId !== "string" || typeof payload.model !== "string" || typeof payload.prompt !== "string" || typeof payload.dataUrl !== "string") return null;
  if (payload.runId.length > 128 || payload.model.length === 0 || payload.model.length > 256 || payload.prompt.length > 4000 || (payload.revisedPrompt !== undefined && (typeof payload.revisedPrompt !== "string" || payload.revisedPrompt.length > 4000))) return null;
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]*={0,2})$/.exec(payload.dataUrl);
  if (!match || match[2].length === 0 || match[2].length % 4 !== 0) return null;
  try {
    const bytes = atob(match[2]);
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_SIZE_BYTES) return null;
  } catch {
    return null;
  }
  return { runId: payload.runId, dataUrl: payload.dataUrl, prompt: payload.prompt, ...(typeof payload.revisedPrompt === "string" ? { revisedPrompt: payload.revisedPrompt } : {}) };
}

export default function ImageGenerationCards({ sessionId }: { sessionId: string }) {
  const { agent, isReady } = useAgent({ agentId: "maju-chat" });
  const [cardsBySession, setCardsBySession] = useState<Record<string, ImageCard[]>>({});

  useEffect(() => {
    if (!isReady) return;
    const subscription = agent.subscribe({
      onCustomEvent: ({ event }) => {
        if (event.name !== "maju.image.generated") return;
        const card = parseImageEvent(event.value, sessionId);
        if (!card) return;
        setCardsBySession((current) => ({
          ...current,
          [sessionId]: current[sessionId]?.some(({ runId }) => runId === card.runId) ? current[sessionId] : [...(current[sessionId] ?? []), card],
        }));
      },
    });
    return () => subscription.unsubscribe();
  }, [agent, isReady, sessionId]);

  const cards = cardsBySession[sessionId] ?? [];
  if (!cards.length) return null;
  return <section className="border-t border-slate-200 p-4" aria-label="已生成的圖片">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => <article key={card.runId} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- generated data URLs are not supported by next/image */}
        <img className="max-h-80 w-full object-contain" src={card.dataUrl} alt={card.revisedPrompt || card.prompt} />
        <div className="p-3 text-sm text-slate-600"><p className="line-clamp-2">{card.revisedPrompt || card.prompt}</p><a className="mt-2 inline-block font-medium text-blue-700 hover:underline" href={card.dataUrl} download={`maju-image-${card.runId}`}>下載圖片</a></div>
      </article>)}
    </div>
  </section>;
}
