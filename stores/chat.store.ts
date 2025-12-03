import { ToolContent } from "ai";
import { create } from "zustand";

type Role = "system" | "user" | "assistant" | "tool";

export interface IMessage {
  role: Role;
  content: string | ToolContent | { type: "text"; text: string } | { type: "text"; text: string }[];
}

interface ChatStore {
  messages: IMessage[];
  addMessage: (message: IMessage) => void;
  addMessages: (messages: IMessage[]) => void;
  setMessages: (messages: IMessage[] | ((messages: IMessage[]) => IMessage[])) => void;
  clearMessages: () => void;
  state: "submitted" | "streaming" | "ready" | "error";
  setState: (state: "submitted" | "streaming" | "ready" | "error") => void;
}

export const useChatStore = create<ChatStore>()(
    (set, get) => ({
      messages: [],
      state: "ready",
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      addMessages: (messages) =>
        set((state) => ({
          messages: [...state.messages, ...messages],
        })),
      setMessages: (messages) =>
        set({
          messages: typeof messages === "function" ? messages(get().messages) : messages,
        }),
      clearMessages: () => set({ messages: [] }),
      setState: (state) => set({ state }),
    })
);

