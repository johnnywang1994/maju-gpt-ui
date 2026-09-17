"use client";

import { useEffect, useRef } from "react";
import { useAgent, UseAgentUpdate } from "@copilotkit/react-core/v2";
import type { Message } from "@ag-ui/core";
import type { ChatSession } from "@/lib/chat-sessions";

type Props = {
  session: ChatSession;
  onMessagesChange: (sessionId: string, messages: Message[]) => void;
};

export default function ChatSessionPersistence({ session, onMessagesChange }: Props) {
  const { agent, isReady } = useAgent({
    agentId: "maju-chat",
    updates: [UseAgentUpdate.OnMessagesChanged],
  });
  const hydratedSessionId = useRef<string>();

  useEffect(() => {
    if (!isReady || hydratedSessionId.current === session.id) return;

    hydratedSessionId.current = undefined;
    agent.setMessages(session.messages);
    queueMicrotask(() => {
      hydratedSessionId.current = session.id;
    });
  }, [agent, isReady, session]);

  const serializedMessages = JSON.stringify(agent.messages);
  useEffect(() => {
    if (!isReady || hydratedSessionId.current !== session.id) return;
    onMessagesChange(session.id, agent.messages);
  }, [agent, isReady, onMessagesChange, serializedMessages, session.id]);

  return null;
}
