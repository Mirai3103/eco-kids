import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
interface User {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  points?: number;
}
function createGuestUser(): User {
  return {
    id: Crypto.randomUUID(),
    name: "Guest",
    avatar: "https://via.placeholder.com/150",
    isGuest: true,
    points: 0,
  };
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateUserPoints: (points: number) => void;
  updateUserAvatar: (avatar: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: createGuestUser(),
      setUser: (user) => set({ user }),
      loginAsGuest: () => set({ user: createGuestUser() }),
      logout: () => set({ user: null }),
      updateUserPoints: (points: number) => set({ user: { ...get().user!, points } }),
      updateUserAvatar: (avatar: string) => set({ user: { ...get().user!, avatar } }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
