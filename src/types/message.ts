export enum RoleType {
  GPT = "assistant",
  USER = "user",
  SYSTEM = "system",
}

export type Message = {
  role: RoleType;
  content: string;
  id: string;
  sentTime: number; // date
};

export type SendMessage = {
  role: RoleType;
  content: string;
};

export type GPTChoice = {
  message: {
    role: string;
    content: string;
  };
  index: number;
  finish_reason: "stop" | "length";
  [key: string]: any;
};

export type RawGPTMessage = {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: GPTChoice[];
};

export type Room = {
  label: string;
  key: string;
};
