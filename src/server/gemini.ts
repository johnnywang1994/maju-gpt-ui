import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

// convert openai message format to gemini content format
function parseGeminiContents(contents: any) {
  if (Array.isArray(contents)) {
    return contents.map((item) => {
      if (item.type === 'text') return { text: item.text }
      if (item.type === 'image_url') return {
        inlineData: {
          mimeType: item.image_url.url.match(/image\/[^;]+/)[0],
          data: item.image_url.url.split(',')[1],
        }
      }
    })
  }
  return contents
}

export async function sendGenerateContent(options: SendGenerateContentOptions) {
  if (!API_KEY) {
    throw Error('env "GEMINI_API_KEY" is not set');
  }
  
  const response = await ai.models.generateContent({
    model: options?.model ?? "gemini-2.5-flash",
    contents: parseGeminiContents(options.prompt),
    config: {
      // candidateCount: 1,
      // systemInstruction: "You are a software engineer who is trying to debug a piece of code.",
      maxOutputTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 0.7,
    },
  });

  return response.text;
}

export async function sendImageGenerate(options: SendImageGenerateOptions) {
  const response = await ai.models.generateContent({
    model: options.model ?? "gemini-2.5-flash-image-preview",
    contents: options.prompt,
  })

  if (response?.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        // console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        return {
          data: [
            {
              url: `data:image/png;base64,${imageData}`
            }
          ]
        }
      }
    }
  }
}

interface SendGenerateContentOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface SendImageGenerateOptions {
  prompt: string;
  model: string;
}