"use client";
import { create } from "zustand";
import { ENABLE_AUTH, LIFF_ID } from "@/lib/env";

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
    if (!ENABLE_AUTH) {
      set({ isInited: true });
      return;
    }
    const { liff } = window as any;
    await liff?.init({
      liffId: LIFF_ID,
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
