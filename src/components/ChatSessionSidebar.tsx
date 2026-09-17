"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ChatSession } from "@/lib/chat-sessions";

type Props = {
  activeSessionId: string;
  sessions: ChatSession[];
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
};

export default function ChatSessionSidebar({ activeSessionId, sessions, onCreateSession, onDeleteSession, onSelectSession }: Props) {
  const orderedSessions = sessions.slice().sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-slate-50 p-3 sm:flex sm:flex-col">
      <button className="mb-3 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white" onClick={onCreateSession}><Plus size={16} />新增對話</button>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {orderedSessions.map((session) => (
          <div key={session.id} className={`flex items-center rounded-lg ${session.id === activeSessionId ? "bg-slate-200" : "hover:bg-slate-100"}`}>
            <button className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm" onClick={() => onSelectSession(session.id)}>{session.title}</button>
            <button className="p-2 text-slate-400 hover:text-rose-600" aria-label={`刪除 ${session.title}`} title="刪除對話" onClick={() => onDeleteSession(session.id)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </aside>
  );
}
