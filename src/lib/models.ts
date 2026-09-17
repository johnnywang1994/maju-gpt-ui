export type ModelOption = {
  id: string;
  label: string;
};

function parseModels(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

export function getModelOptions(): ModelOption[] {
  const defaultModel = env.OPENAI_MODEL?.trim();
  const modelIds = [...new Set([defaultModel, ...parseModels(env.OPENAI_MODELS)].filter(Boolean))] as string[];

  if (!modelIds.length) {
    throw new Error("OPENAI_MODEL or OPENAI_MODELS must be configured");
  }

  return modelIds.map((id) => ({ id, label: id }));
}

export function getImageModelOptions(): ModelOption[] {
  return [...new Set(parseModels(env.OPENAI_IMAGE_MODELS))].map((id) => ({ id, label: id }));
}

export function isAllowedImageModel(model: string): boolean {
  return getImageModelOptions().some((option) => option.id === model);
}

export function isAllowedModel(model: string): boolean {
  return getModelOptions().some((option) => option.id === model);
}
import env from "@/lib/env/server";
