"use client";

import { Settings2, X } from "lucide-react";
import type { ChatSettings } from "@/lib/chat-settings";
import type { ModelOption } from "@/lib/models";
import { PROMPT_VARIABLES } from "@/lib/prompt-variables";

type Props = {
  model: string;
  modelOptions: ModelOption[];
  imageModelOptions: ModelOption[];
  settings: ChatSettings;
  open: boolean;
  onClose: () => void;
  onModelChange: (model: string) => void;
  onSettingsChange: (settings: ChatSettings) => void;
};

export default function SettingsDrawer({ model, modelOptions, imageModelOptions, settings, open, onClose, onModelChange, onSettingsChange }: Props) {
  if (!open) return null;

  function updateSetting<Key extends keyof ChatSettings>(key: Key, value: ChatSettings[Key]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/40" role="presentation" onClick={onClose}>
      <aside className="ml-auto flex h-full w-80 flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="設定" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold"><Settings2 size={18} />設定</h2>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="關閉設定" title="關閉設定" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="p-5">
          <label className="block text-sm font-medium text-slate-700" htmlFor="mode-select">模式</label>
          <select id="mode-select" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={settings.mode} onChange={(event) => updateSetting("mode", event.target.value === "image" ? "image" : "chat")}>
            <option value="chat">Chat</option>
            {imageModelOptions.length > 0 && <option value="image">Generate image</option>}
          </select>
          {settings.mode === "image" && imageModelOptions.length > 0 && <>
            <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="image-model-select">圖片模型</label>
            <select id="image-model-select" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={settings.imageModel || imageModelOptions[0].id} onChange={(event) => updateSetting("imageModel", event.target.value)}>
              {imageModelOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <p className="text-sm text-slate-500">圖片模型清單由伺服器端的 OPENAI_IMAGE_MODELS 設定。</p>
          </>}
          {settings.mode === "chat" && <>
          <label className="block text-sm font-medium text-slate-700" htmlFor="model-select">模型</label>
          <select id="model-select" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={model} onChange={(event) => onModelChange(event.target.value)}>
            {modelOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <p className="text-sm text-slate-500">模型清單由伺服器端的 OPENAI_MODELS 設定。</p>
          <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="temperature">Temperature</label>
          <input id="temperature" className="mt-2 w-full" type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(event) => updateSetting("temperature", Number(event.target.value))} />
          <p className="text-sm text-slate-500">{settings.temperature.toFixed(1)}，較低更穩定，較高更有創意。</p>
          <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="max-tokens">最大輸出 Tokens</label>
          <input id="max-tokens" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" max="4096" value={settings.maxTokens} onChange={(event) => updateSetting("maxTokens", Number(event.target.value))} />
          <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="system-prompt">System Prompt</label>
          <textarea id="system-prompt" className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" maxLength={4000} value={settings.systemPrompt} onChange={(event) => updateSetting("systemPrompt", event.target.value)} placeholder="可選。設定助理的角色或回覆規則。" />
          <p className="mt-2 text-sm text-slate-500">
            可使用變數：
            {PROMPT_VARIABLES.map(({ token, label }) => <code key={token} title={label} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{token}</code>)}
            ，送出時會自動代入。
          </p>
          <label className="mt-5 flex items-center justify-between text-sm font-medium text-slate-700" htmlFor="enable-web-search">
            <span>網路搜尋</span>
            <input id="enable-web-search" type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" checked={settings.enableWebSearch} onChange={(event) => updateSetting("enableWebSearch", event.target.checked)} />
          </label>
          <p className="text-sm text-slate-500">允許模型透過網頁搜尋取得即時資訊。</p>
          </>}
        </div>
      </aside>
    </div>
  );
}
