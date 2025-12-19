import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingState {
  isDefaultAutoPlay: boolean;
  defaultLanguage: "vi" | "en";
  defaultGender: "male" | "female";
  isImproveASR: boolean;
  setIsDefaultAutoPlay: (value: boolean) => void;
  setDefaultLanguage: (value: "vi" | "en") => void;
  setDefaultGender: (value: "male" | "female") => void;
  toggleImproveASR: () => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      isDefaultAutoPlay: false,
      defaultLanguage: "vi",
      defaultGender: "male",
      isImproveASR: false,
      setIsDefaultAutoPlay: (value) => set({ isDefaultAutoPlay: value }),
      setDefaultLanguage: (value) => set({ defaultLanguage: value }),
      setDefaultGender: (value) => set({ defaultGender: value }),
      toggleImproveASR: () => set((state) => ({ isImproveASR: !state.isImproveASR })),
    }),
    {
      name: "setting-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
