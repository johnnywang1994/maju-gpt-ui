import { create } from "zustand";
import { MAX_TOKENS } from "@/lib/env";

export enum PageTab {
  Chat = 'chat',
  Image = 'image',
}

export enum DefaultModel {
  Chat = 'gpt-4o',
  DeepSeekChat = 'deepseek-chat',
  Image = 'dall-e-3'
}

export enum ModelProvider {
  OpenAI = 'openai',
  DeepSeek = 'deepseek',
}

interface Settings {
  username: string;
  gptname: string;
  provider: ModelProvider;
  model: string;
  temperature: number;
  size: string;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableSystemPrompt: boolean;
  role: string;
  goodAt: string;
  topics: string;
}

interface StoreUtil {
  pageTab: PageTab;
  openDrawer: boolean;
  openSetting: boolean;
  settings: Settings;
  computed: {
    systemPrompt: string;
  };
  openApiKeyModal: boolean;
  apiKey?: string;
  setApiKeyModal: (bool: boolean) => void;
  setApiKey: (key: string) => void;
  setPageTab: (tab: PageTab) => void;
  toggleDrawer: (bool?: boolean) => void;
  toggleSetting: (bool?: boolean) => void;
  setSettings: (newSettings: Partial<Settings>) => void;
}

export const localSettingKey = "maju-gpt_settings";

const useCommon = create<StoreUtil>((set, get) => ({
  pageTab: PageTab.Chat,
  openDrawer: false,
  openSetting: false,
  settings: {
    // user options
    username: "Me",
    gptname: "ChatGPT",
    provider: ModelProvider.OpenAI,
    // api options
    model: DefaultModel.Chat,
    temperature: 0.5,
    size: '1024x1024',
    maxTokens: Math.min(256, MAX_TOKENS),
    frequencyPenalty: 0,
    presencePenalty: 0,
    // system prompt
    enableSystemPrompt: false,
    role: "Programmer",
    goodAt:
      "using Javascript, VueJs, ReactJs, NextJs to create website and CMS",
    topics: "programming and Ant Design",
  },
  computed: {
    // https://github.com/f/awesome-chatgpt-prompts?tab=readme-ov-file#act-as-a-math-teacher
    get systemPrompt() {
      const { settings } = get();
      const { role, goodAt, topics } = settings;
      return `I want you to act as a professional ${role}.You are good at ${goodAt}.User will provide some topics or questions related to ${topics}, and it will be your job to explain them in easy-to-understand terms.This could include providing step-by-step instructions for solving a problem, demonstrating various techniques with visuals or suggesting online resources for further study.`;
    },
  },
  // for static mode
  openApiKeyModal: false,
  apiKey: undefined,
  setApiKeyModal: (bool: boolean) => set({ openApiKeyModal: bool }),
  setApiKey: (key: string) => set({ apiKey: key }),
  setPageTab: (tab: PageTab) => set({ pageTab: tab }),

  toggleDrawer: (bool?: boolean) => {
    const { openDrawer } = get();
    set({
      openDrawer: typeof bool === "boolean" ? bool : !openDrawer,
    });
  },

  toggleSetting: (bool?: boolean) => {
    const { openSetting } = get();
    set({
      openSetting: typeof bool === "boolean" ? bool : !openSetting,
    });
  },

  setSettings: (newSettings: Partial<Settings> & { apiKey?: string }) => {
    const { settings, apiKey: cacheApiKey } = get();
    let apiKey = cacheApiKey;
    if (newSettings.apiKey) {
      apiKey = newSettings.apiKey;
      delete newSettings["apiKey"];
    }
    const replaceSettings = { ...settings, ...newSettings };
    set({
      apiKey,
      settings: replaceSettings,
    });
    localStorage.setItem(localSettingKey, JSON.stringify(replaceSettings));
  },
}));

export default useCommon;
