import { create } from "zustand";


interface ReadStore {
  lastReadStoryId: string | null;
  setLastReadStoryId: (lastReadStoryId: string) => void;
}

export const useReadStore = create<ReadStore>()(
    (set, get) => ({
      lastReadStoryId: null,
      setLastReadStoryId: (lastReadStoryId: string) => set({ lastReadStoryId }),
    })
)