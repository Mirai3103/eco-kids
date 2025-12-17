import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { Session } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  points?: number;
  birthdday?: string | null;
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
  session: Session | null;
  isLoadingSession: boolean;
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  initSession: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateUserPoints: (points: number) => void;
  updateUserAvatar: (avatar: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoadingSession: true,
      
      setUser: (user) => set({ user }),
      
      setSession: (session) => set({ session, isLoadingSession: false }),
      
      initSession: async () => {
        try {
          set({ isLoadingSession: true });
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            Sentry.captureException(error);
            set({ session: null, isLoadingSession: false });
            return;
          }
          
          Sentry.captureMessage("Session loaded: " + JSON.stringify(session));
          set({ session, isLoadingSession: false });
          
          // Setup auth state change listener
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ session });
            if (!session) {
              set({ user: null });
            }
          });
        } catch (error) {
          Sentry.captureException(error);
          set({ session: null, isLoadingSession: false });
        }
      },
      
      loginAsGuest: () => set({ user: createGuestUser(), session: null }),
      
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Sentry.captureException(error);
          }
          set({ user: null, session: null });
        } catch (error) {
          Sentry.captureException(error);
          set({ user: null, session: null });
        }
      },
      
      updateUserPoints: (points: number) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, points } });
        }
      },
      
      updateUserAvatar: (avatar: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, avatar } });
        }
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        // Don't persist session - it should be fetched fresh
      }),
    }
  )
);
