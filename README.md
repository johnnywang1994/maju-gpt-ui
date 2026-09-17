# Maju Chat

Maju Chat is a CopilotKit v2 chat UI backed by a Next.js AG-UI endpoint. The server uses the OpenAI SDK against any OpenAI-compatible provider, including OpenRouter. Chat history is stored in browser localStorage.

## Getting Started

Create `.env.local`:

```bash
# For OpenRouter, use https://openrouter.ai/api/v1
OPENAI_API_KEY=your-provider-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4.1-mini
# Comma-separated choices shown in the model selector. Include OPENAI_MODEL.
OPENAI_MODELS=openai/gpt-4.1-mini,anthropic/claude-sonnet-4
# Comma-separated subset of OPENAI_MODELS that support vision requests.
OPENAI_VISION_MODELS=openai/gpt-4.1-mini
# Enables the Generate image mode. This is an independent server-side allowlist.
OPENAI_IMAGE_MODELS=openai/gpt-image-1
# Optional dedicated image-generation key; otherwise OPENAI_API_KEY is used.
OPENAI_IMAGE_API_KEY=
# This is not derived from OPENAI_BASE_URL. OpenRouter's image endpoint is the default.
OPENAI_IMAGE_GENERATIONS_URL=https://openrouter.ai/api/v1/images

# Optional LIFF access-token validation.
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_LIFF_ID=
LINE_CHANNEL_ID=
```

Install dependencies and start the application:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Model Providers

All model requests use the OpenAI Chat Completions API. Set `OPENAI_BASE_URL` to your compatible provider endpoint and configure the permitted model IDs with `OPENAI_MODELS`. The browser can select only models in that server-side allowlist.

## Image Attachments

CopilotKit native attachments accept one JPEG, PNG, WebP, or HEIC image per request. Original files must be at most 4 MiB. HEIC is converted to JPEG and images are compressed client-side before sending; the resulting payload must also be at most 4 MiB. The server accepts only validated JPEG/PNG/WebP base64 image data and sends it to the configured provider as an `image_url` data URL. Requests with images require their selected model to be listed in `OPENAI_VISION_MODELS`.

Image bytes are ephemeral: they are not retained in browser localStorage session history. Accompanying text and an `[Image attached]` marker are retained so titles and saved sessions remain useful.

## Image Generation

When `OPENAI_IMAGE_MODELS` has at least one model, Settings offers **Generate image** mode and its model picker. It sends only the current text prompt to the server-only `OPENAI_IMAGE_GENERATIONS_URL`; attachments are unavailable in this mode. Generated image cards stay in memory for their active chat session only, and disappear on reload.

## LINE Auth

Set `NEXT_PUBLIC_ENABLE_AUTH=true`, `NEXT_PUBLIC_LIFF_ID`, and `LINE_CHANNEL_ID` to require a valid LIFF access token for every AG-UI request.
