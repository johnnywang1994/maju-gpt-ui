"use client";
import { create } from "zustand";

import { random } from "@/lib/random";
// import { mockMessages } from '@/lib/mock';
import { Message, RoleType, Room, ContentObject } from "@/types/message";

type AddMessagePayload = {
  id?: string;
  sentTime?: number;
  role: RoleType;
  content: string | ContentObject[];
};

interface StoreUtil {
  isInited: boolean;
  currentRoom: Room;
  roomHistory: Room[];
  messages: Message[];
  updateCurrentRoom: (newLabel: string) => void;
  deleteRoom: (targetRoom: Room) => void;
  addMessage: (payload: AddMessagePayload) => void;
  deleteMessage: (messageId: string) => void;
  setChatroom: (room: Room) => void;
  initialize: () => void;
}

export const localRoomHistoryKey = "maju-gpt-history";

export const newRoom = () => ({
  label: "New Chat",
  key: random(),
});

const keyPrefix = (key: string) => `maju-gpt_room-${key}`;

const getRoomHistory = () => {
  return JSON.parse(localStorage.getItem(localRoomHistoryKey) ?? "[]");
};

const getRoomMessages = (key: string) => {
  return JSON.parse(localStorage.getItem(keyPrefix(key)) ?? "[]");
};

const setRoomHistory = (history: Room[]) => {
  localStorage.setItem(localRoomHistoryKey, JSON.stringify(history));
};

const setRoomMessages = (key: string, messages: Message[]) => {
  localStorage.setItem(keyPrefix(key), JSON.stringify(messages));
};

const useMessages = create<StoreUtil>((set, get) => ({
  isInited: false,
  currentRoom: {
    label: "",
    key: "",
  },
  roomHistory: [],
  messages: [],

  updateCurrentRoom: (label: string) => {
    const { currentRoom, roomHistory } = get();
    const roomKey = currentRoom.key;
    const newRoomHistory = [...roomHistory];
    const room = newRoomHistory.find(({ key }) => key === roomKey);
    if (room) {
      room.label = label;
      set({
        currentRoom: {
          key: roomKey,
          label,
        },
        roomHistory: newRoomHistory,
      });
      setRoomHistory(newRoomHistory);
    }
  },

  deleteRoom: (targetRoom: Room) => {
    const { currentRoom, roomHistory, setChatroom } = get();
    const newRoomHistory = [...roomHistory];
    const roomIndex = newRoomHistory.findIndex(
      ({ key }) => key === targetRoom.key
    );
    if (roomIndex > -1) {
      newRoomHistory.splice(roomIndex, 1);
      if (targetRoom.key === currentRoom.key) {
        setChatroom(newRoomHistory[0] ?? newRoom());
      }
    }
    set({
      roomHistory: newRoomHistory,
    });
    localStorage.removeItem(keyPrefix(targetRoom.key));
    setRoomHistory(newRoomHistory);
  },

  addMessage: (payload: AddMessagePayload) => {
    const { messages, currentRoom, roomHistory } = get();
    const newMessages = [
      ...messages,
      {
        id: random(),
        sentTime: Date.now(),
        ...payload,
      },
    ];
    set({ messages: newMessages });
    try {
      const roomKey = currentRoom.key;
      setRoomMessages(roomKey, newMessages);
      // create when room not exist
      if (roomHistory.findIndex((room) => room.key === roomKey) < 0) {
        const newRoomHistory = [...roomHistory];
        newRoomHistory.push(currentRoom);
        set({
          roomHistory: newRoomHistory,
        });
        setRoomHistory(newRoomHistory);
      }
    } catch (err) {
      console.warn(err);
    }
  },

  deleteMessage: (messageId: string) => {
    const { messages, currentRoom } = get();
    const targetIdx = messages.findIndex(({ id }) => id === messageId);
    if (targetIdx > -1) {
      const newMessages = [...messages];
      newMessages.splice(targetIdx, 1);
      set({
        messages: newMessages,
      });
      setRoomMessages(currentRoom.key, newMessages);
    }
  },

  setChatroom: (room: Room) => {
    const { currentRoom } = get();
    if (currentRoom.key === room.key) return;
    const messages = getRoomMessages(room.key);
    set({
      currentRoom: room,
      messages: messages, // mockMessages.map(parseMessage),
    });
  },

  initialize: () => {
    const { setChatroom } = get();
    const roomHistory = getRoomHistory();
    set({
      isInited: true,
      roomHistory: roomHistory,
    });
    setChatroom(roomHistory[0] ?? newRoom());
  },
}));

export default useMessages;

export function parseChatMessage(rawMessage: any): Message {
  return {
    id: rawMessage.id,
    role: RoleType.GPT,
    content: rawMessage.choices[0].message.content,
    sentTime: rawMessage.created,
  };
}

export function parseImageMessage(rawMessage: any): Message {
  return {
    id: random(),
    role: RoleType.GPT,
    content: rawMessage.url,
    sentTime: Date.now(),
  };
}