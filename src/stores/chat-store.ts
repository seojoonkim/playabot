import { create } from 'zustand';
import type { Message } from '@/types/chat';
import { getChatHistory, saveChatHistory } from '@/lib/db';

interface ChatStore {
  messages: Message[];
  currentIdolId: string | null;
  isStreaming: boolean;
  error: string | null;
  historyLoaded: boolean;

  setCurrentIdol: (idolId: string | null) => void;
  loadHistory: (idolId: string) => Promise<void>;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  persistMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  currentIdolId: null,
  isStreaming: false,
  error: null,
  historyLoaded: false,

  setCurrentIdol: (idolId) => {
    // Save current conversation before switching
    const { currentIdolId, messages } = get();
    if (currentIdolId && messages.length > 0) {
      saveChatHistory(currentIdolId, messages).catch(() => {});
    }
    set({
      currentIdolId: idolId,
      messages: [],
      error: null,
      historyLoaded: false,
      isStreaming: false,
    });
    // Load history for the new idol
    if (idolId) {
      get().loadHistory(idolId);
    }
  },

  loadHistory: async (idolId) => {
    try {
      const messages = await getChatHistory(idolId);
      // Only set if we're still on the same idol
      if (get().currentIdolId === idolId) {
        set({ messages, historyLoaded: true });
      }
    } catch {
      set({ historyLoaded: true });
    }
  },

  addMessage: (role, content) =>
    set((state) => {
      const newMessages = [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: Date.now(),
        },
      ];
      return { messages: newMessages };
    }),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i]!.role === 'assistant') {
          msgs[i] = { ...msgs[i]!, content };
          break;
        }
      }
      return { messages: msgs };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setError: (error) => set({ error }),

  clearMessages: () => {
    const { currentIdolId } = get();
    set({ messages: [], error: null });
    if (currentIdolId) {
      saveChatHistory(currentIdolId, []).catch(() => {});
    }
  },

  persistMessages: () => {
    const { currentIdolId, messages } = get();
    if (currentIdolId && messages.length > 0) {
      saveChatHistory(currentIdolId, messages).catch(() => {});
    }
  },
}));
