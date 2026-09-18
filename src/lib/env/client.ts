import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  client: {
    NEXT_PUBLIC_ENABLE_AUTH: z.boolean().default(false),
    NEXT_PUBLIC_LIFF_ID: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENABLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_AUTH === "true",
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT,
  },
});

export default env;
