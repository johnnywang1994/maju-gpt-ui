"use client";
import { FC, PropsWithChildren } from "react";
import { create } from "zustand";
import ConfigProvider from "antd/es/config-provider";
import theme from "antd/es/theme";

const { defaultAlgorithm, darkAlgorithm } = theme;

interface StoreUtil {
  isDarkMode: boolean;
  toggleIsDarkMode: (isDark?: boolean) => void;
  initialize: () => void;
}

enum ThemeMode {
  System = "system",
  Light = "light",
  Dark = "dark",
}

const localThemeKey = "maju-gpt_theme";

const useAntConfig = create<StoreUtil>((set, get) => ({
  isDarkMode: false,

  toggleIsDarkMode: (isDark?: boolean) => {
    const next = typeof isDark === "boolean" ? isDark : !get().isDarkMode;
    const nextTheme = next ? ThemeMode.Dark : ThemeMode.Light;
    const prevTheme = next ? ThemeMode.Light : ThemeMode.Dark;
    set({
      isDarkMode: next,
    });
    localStorage.setItem(localThemeKey, nextTheme);
    // for tailwindcss
    const doc = document.documentElement || document.body;
    if (doc.classList.contains(prevTheme)) {
      doc.classList.remove(prevTheme);
    }
    doc.classList.add(nextTheme);
  },

  initialize: () => {
    const { toggleIsDarkMode } = get();
    const defaultTheme =
      localStorage.getItem(localThemeKey) || getSystemTheme();
    toggleIsDarkMode(defaultTheme === ThemeMode.Dark);
  },
}));

export default useAntConfig;

export const AntConfigProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isDarkMode } = useAntConfig();
  const themeConfig = {
    algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
    token: {},
    components: {},
  };
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};

const getSystemTheme = () => {
  const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
  return matchMedia.matches ? ThemeMode.Dark : ThemeMode.Light;
};
