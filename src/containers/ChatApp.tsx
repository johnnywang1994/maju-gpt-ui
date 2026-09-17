"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";
import type { Message } from "@ag-ui/core";
import ChatHeader from "@/components/ChatHeader";
import ChatSessionPersistence from "@/components/ChatSessionPersistence";
import ChatSessionSidebar from "@/components/ChatSessionSidebar";
import MajuMessageView from "@/components/CopilotMessageView";
import SettingsDrawer from "@/components/SettingsDrawer";
import ImageGenerationCards from "@/components/ImageGenerationCards";
import useLiff from "@/hooks/useLiff";
import {
  ACTIVE_CHAT_SESSION_KEY,
  createChatSession,
  getSessionTitle,
  normalizeMessages,
  readChatSessions,
  writeChatSessions,
  type ChatSession,
} from "@/lib/chat-sessions";
import { CHAT_SETTINGS_KEY, defaultChatSettings, readChatSettings, type ChatSettings } from "@/lib/chat-settings";
import env from "@/lib/env/client";
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_BYTES, prepareImageAttachment } from "@/lib/image-upload";
import type { ModelOption } from "@/lib/models";

type Props = { modelOptions: ModelOption[]; imageModelOptions: ModelOption[] };

export default function ChatApp({ modelOptions, imageModelOptions }: Props) {
  const [model, setModel] = useState(modelOptions[0].id);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [sessionsReady, setSessionsReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(defaultChatSettings);
  const uploadedImageCount = useRef(0);
  const { accessToken, initialize, isInited } = useLiff();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const storedSessions = readChatSessions();
    const initialSessions = storedSessions.length ? storedSessions : [createChatSession()];
    const storedActiveSessionId = localStorage.getItem(ACTIVE_CHAT_SESSION_KEY);
    const initialActiveSessionId = initialSessions.some((session) => session.id === storedActiveSessionId)
      ? storedActiveSessionId!
      : initialSessions[0].id;

    setSessions(initialSessions);
    setActiveSessionId(initialActiveSessionId);
    writeChatSessions(initialSessions);
    localStorage.setItem(ACTIVE_CHAT_SESSION_KEY, initialActiveSessionId);
    setSessionsReady(true);
  }, []);

  useEffect(() => {
    setSettings(readChatSettings());
  }, []);

  const activeSession = sessions.find((session) => session.id === activeSessionId);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem(ACTIVE_CHAT_SESSION_KEY, sessionId);
  }, []);

  const createSession = useCallback(() => {
    const session = createChatSession();
    setSessions((currentSessions) => {
      const nextSessions = [session, ...currentSessions];
      writeChatSessions(nextSessions);
      return nextSessions;
    });
    selectSession(session.id);
  }, [selectSession]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((currentSessions) => {
      const nextSessions = currentSessions.filter((session) => session.id !== sessionId);
      const remainingSessions = nextSessions.length ? nextSessions : [createChatSession()];
      writeChatSessions(remainingSessions);
      if (sessionId === activeSessionId) selectSession(remainingSessions[0].id);
      return remainingSessions;
    });
  }, [activeSessionId, selectSession]);

  const handleMessagesChange = useCallback((sessionId: string, messages: Message[]) => {
    if (messages.some((message) => Array.isArray(message.content))) uploadedImageCount.current = 0;
    const normalizedMessages = normalizeMessages(messages);
    setSessions((currentSessions) => {
      const nextSessions = currentSessions.map((session) => session.id === sessionId ? {
        ...session,
        messages: normalizedMessages,
        title: getSessionTitle(normalizedMessages),
        updatedAt: Date.now(),
      } : session);
      writeChatSessions(nextSessions);
      return nextSessions;
    });
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    if (uploadedImageCount.current > 0) throw new Error("一次只能上傳一張圖片");
    uploadedImageCount.current += 1;
    try {
      return await prepareImageAttachment(file);
    } catch (error) {
      uploadedImageCount.current -= 1;
      throw error;
    }
  }, []);

  const updateSettings = useCallback((nextSettings: ChatSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(nextSettings));
  }, []);

  const imageModeAvailable = imageModelOptions.length > 0;
  const imageMode = imageModeAvailable && settings.mode === "image";
  const effectiveSettings = imageMode && !settings.imageModel
    ? { ...settings, imageModel: imageModelOptions[0].id }
    : settings;

  if ((env.NEXT_PUBLIC_ENABLE_AUTH && !isInited) || !sessionsReady || !activeSession) {
    return (
      <>
        <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={() => void initialize()} />
        <main className="grid min-h-dvh place-items-center bg-slate-950 text-slate-100">正在登入...</main>
      </>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-slate-950 p-0 text-slate-900 sm:p-6">
      {env.NEXT_PUBLIC_ENABLE_AUTH && <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" onLoad={() => void initialize()} />}
      <CopilotKit runtimeUrl="/api/agui" agentId="maju-chat" useSingleEndpoint headers={(): Record<string, string> => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {})} properties={{ model, ...effectiveSettings }}>
        <ChatSessionPersistence key={activeSession.id} session={activeSession} onMessagesChange={handleMessagesChange} />
        <section className="flex h-dvh w-full overflow-hidden bg-white sm:h-[min(860px,calc(100vh-48px))] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-white/20 sm:shadow-2xl" aria-label="Maju Chat">
          <ChatSessionSidebar activeSessionId={activeSession.id} sessions={sessions} onCreateSession={createSession} onDeleteSession={deleteSession} onSelectSession={selectSession} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ChatHeader activeSession={activeSession} sessions={sessions} onCreateSession={createSession} onDeleteSession={deleteSession} onSelectSession={selectSession} onOpenSettings={() => setSettingsOpen(true)} />
            <CopilotChat agentId="maju-chat" threadId={activeSession.id} className="min-h-0 flex-1" messageView={MajuMessageView} attachments={{ enabled: !imageMode, accept: IMAGE_ACCEPT, maxSize: MAX_IMAGE_SIZE_BYTES, onUpload: uploadImage }} labels={{ welcomeMessageText: "嗨，有什麼我可以協助的？", chatInputPlaceholder: imageMode ? "描述要生成的圖片..." : "輸入你的問題...", chatDisclaimerText: "人工智慧可能會出錯，請核對重要資訊。" }} />
            <ImageGenerationCards sessionId={activeSession.id} />
          </div>
        </section>
        <SettingsDrawer model={model} modelOptions={modelOptions} imageModelOptions={imageModelOptions} settings={effectiveSettings} open={settingsOpen} onClose={() => setSettingsOpen(false)} onModelChange={setModel} onSettingsChange={updateSettings} />
      </CopilotKit>
    </main>
  );
}
