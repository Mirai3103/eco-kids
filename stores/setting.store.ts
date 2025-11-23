import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingState {
  isDefaultAutoPlay: boolean;
  defaultLanguage: "vi" | "en";
  defaultGender: "male" | "female";
  
  setIsDefaultAutoPlay: (value: boolean) => void;
  setDefaultLanguage: (value: "vi" | "en") => void;
  setDefaultGender: (value: "male" | "female") => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      isDefaultAutoPlay: false,
      defaultLanguage: "vi",
      defaultGender: "male",

      setIsDefaultAutoPlay: (value) => set({ isDefaultAutoPlay: value }),
      setDefaultLanguage: (value) => set({ defaultLanguage: value }),
      setDefaultGender: (value) => set({ defaultGender: value }),
    }),
    {
      name: "setting-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
