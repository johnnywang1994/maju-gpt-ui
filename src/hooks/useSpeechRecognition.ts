import { create } from "zustand";


const browserSupportsSpeechRecognition =
  (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) &&
  // brave browser does not support speech recognition
  // ref: https://stackoverflow.com/a/74114170
  !('brave' in navigator);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface StartListeningOptions {
  continuous?: boolean;
  language?: string;
}

interface StoreUtil {
  transcript: string;
  listening: boolean;
  recognition: SpeechRecognition | null;
  browserSupportsSpeechRecognition: boolean;
  startListening: (options?: StartListeningOptions) => void;
  stopListening: () => void;
}

export const useSpeechRecognition = create<StoreUtil>((set, get) => ({
  transcript: '',
  listening: false,
  recognition: null,
  browserSupportsSpeechRecognition,
  startListening: ({
    language = 'zh-TW',
    continuous = false,
  }: StartListeningOptions = {}) => {
    if (!browserSupportsSpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language; // 設置為繁體中文
    recognition.continuous = continuous; // 是否連續辨識
    recognition.interimResults = false; // 是否返回中間結果
    recognition.maxAlternatives = 1; // 最大返回的可能結果數量

    const resultListener = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript; // 獲取轉譯文本
      set({ transcript: result });
    };

    const endListener = () => {
      recognition.removeEventListener('result', resultListener);
      recognition.removeEventListener('end', endListener);
      set({ listening: false });
    };

    recognition.addEventListener('result', resultListener);

    recognition.addEventListener('end', endListener);

    recognition.start();

    set({
      transcript: '',
      listening: true,
      recognition,
    });
  },

  stopListening: () => {
    if (!browserSupportsSpeechRecognition) return;
    const { recognition } = get();
    recognition?.stop();
    set({ listening: false });
  },
}));
