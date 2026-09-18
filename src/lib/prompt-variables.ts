export type PromptVariable = {
  token: string;
  label: string;
  description: string;
};

export const PROMPT_VARIABLES: PromptVariable[] = [
  {
    token: "{currentTime}",
    label: "目前時間",
    description: "目前的日期與時間。",
  },
];

type VariableRenderer = (date: Date, timeZone?: string) => string;

const promptVariableRenderers: Record<string, VariableRenderer> = {
  currentTime: formatCurrentTime,
};

export function formatCurrentTime(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    ...(timeZone ? { timeZone } : {}),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function expandPromptVariables(template: string, timeZone?: string): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (match, name: string) => {
    const renderer = promptVariableRenderers[name];
    return renderer ? renderer(new Date(), timeZone) : match;
  });
}