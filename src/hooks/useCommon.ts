import { create } from "zustand";
import { MAX_TOKENS } from "@/lib/env";

interface Settings {
  username: string;
  gptname: string;
  model: string;
  temperature: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  enableSystemPrompt: boolean;
  role: string;
  goodAt: string;
  topics: string;
}

interface StoreUtil {
  openDrawer: boolean;
  openSetting: boolean;
  settings: Settings;
  computed: {
    systemPrompt: string;
  };
  toggleDrawer: (bool?: boolean) => void;
  toggleSetting: (bool?: boolean) => void;
  setSettings: (newSettings: Partial<Settings>) => void;
}

export const localSettingKey = "maju-gpt_settings";

const useCommon = create<StoreUtil>((set, get) => ({
  openDrawer: false,
  openSetting: false,
  settings: {
    // user options
    username: "Me",
    gptname: "ChatGPT",
    // api options
    model: "gpt-3.5-turbo",
    temperature: 0.5,
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

  setSettings: (newSettings: Partial<Settings>) => {
    const { settings } = get();
    set({
      settings: { ...settings, ...newSettings },
    });
    localStorage.setItem(localSettingKey, JSON.stringify(newSettings));
  },
}));

export default useCommon;
