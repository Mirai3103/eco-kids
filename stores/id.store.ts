import * as Crypto from "expo-crypto";
import { create } from "zustand";
interface IdStore {
  id: string;
    resetId: () => void;
}

export const useIdStore = create<IdStore>()((set,get) => ({
  id: Crypto.randomUUID(),
  resetId: () => set({ id: Crypto.randomUUID() }),
  setId: (id: string) => set({ id }),
}));