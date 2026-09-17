"use client";
import { create } from "zustand";
import env from "@/lib/env/client";

interface StoreUtil {
  isInited: boolean;
  accessToken: string;
  liff?: any;
  initialize: () => Promise<void>;
}

const useLiff = create<StoreUtil>((set) => ({
  isInited: false,
  accessToken: "",
  liff: undefined,

  initialize: async () => {
    if (!env.NEXT_PUBLIC_ENABLE_AUTH) {
      set({ isInited: true });
      return;
    }
    const { liff } = window as any;
    await liff?.init({
      liffId: env.NEXT_PUBLIC_LIFF_ID,
    });
    if (!liff?.isLoggedIn()) {
      liff?.login({ redirectUri: window.location.href });
      return;
    }
    set({
      liff,
      isInited: true,
      accessToken: liff.getAccessToken() as string,
    });
  },
}));

export default useLiff;
