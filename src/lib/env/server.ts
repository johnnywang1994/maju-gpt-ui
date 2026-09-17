import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isBuild = process.env.BUILD === "true";
const isTest = process.env.NODE_ENV === "test";

const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_BASE_URL: z.string().url().refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "OPENAI_BASE_URL must use HTTP(S)",
    ),
    OPENAI_MODEL: z.string().min(1),
    OPENAI_MODELS: z.string().optional(),
    OPENAI_VISION_MODELS: z.string().optional(),
    OPENAI_IMAGE_MODELS: z.string().optional(),
    OPENAI_IMAGE_API_KEY: z.string().min(1).optional(),
    OPENAI_IMAGE_GENERATIONS_URL: z.string().url().refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "OPENAI_IMAGE_GENERATIONS_URL must use HTTP(S)",
    ).default("https://openrouter.ai/api/v1/images"),
    LINE_CHANNEL_ID: z.string().optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_MODELS: process.env.OPENAI_MODELS,
    OPENAI_VISION_MODELS: process.env.OPENAI_VISION_MODELS,
    OPENAI_IMAGE_MODELS: process.env.OPENAI_IMAGE_MODELS,
    OPENAI_IMAGE_API_KEY: process.env.OPENAI_IMAGE_API_KEY,
    OPENAI_IMAGE_GENERATIONS_URL: process.env.OPENAI_IMAGE_GENERATIONS_URL,
    LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
  },
  skipValidation: isBuild || isTest,
});

export default env;
