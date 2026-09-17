"use client";

import { Plus, Settings2, Trash2 } from "lucide-react";
import type { ChatSession } from "@/lib/chat-sessions";

type Props = {
  activeSession: ChatSession;
  sessions: ChatSession[];
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onOpenSettings: () => void;
};

export default function ChatHeader({
  activeSession,
  sessions,
  onCreateSession,
  onDeleteSession,
  onSelectSession,
  onOpenSettings,
}: Props) {
  const orderedSessions = sessions.slice().sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold">Maju Chat</h1>
        <p className="m-0 text-sm text-slate-500">OpenAI-compatible text chat</p>
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <select className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" value={activeSession.id} onChange={(event) => onSelectSession(event.target.value)}>
            {orderedSessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}
          </select>
          <button className="rounded-lg border border-slate-300 p-1.5 text-slate-700" aria-label="新增對話" title="新增對話" onClick={onCreateSession}><Plus size={16} /></button>
          <button className="rounded-lg border border-slate-300 p-1.5 text-rose-600" aria-label="刪除目前對話" title="刪除目前對話" onClick={() => onDeleteSession(activeSession.id)}><Trash2 size={16} /></button>
        </div>
      </div>
      <button className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" aria-label="設定" onClick={onOpenSettings}><Settings2 size={16} /><span className="hidden sm:inline">設定</span></button>
    </header>
  );
}
