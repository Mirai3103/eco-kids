import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { Session } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";
import * as Network from "expo-network";
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
  isOfflineMode: boolean;
  setUser: (user: User) => void;
  setSession: (session: Session | null) => void;
  initSession: () => Promise<void>;
  initialized: boolean;
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
      isOfflineMode: false,
      initialized: false,
      setUser: (user) => set({ user }),
      
      setSession: (session) => set({ session, isLoadingSession: false }),
      
      initSession: async () => {
        console.log("initSession");
        if(get().initialized) {
          return;
        }
        set({ initialized: true });
        try {
          set({ isLoadingSession: true });
          
          // Check network connectivity
          const networkState = await Network.getNetworkStateAsync();
          const isConnected = networkState.isConnected && networkState.isInternetReachable;
          
          // Get cached session from store (persisted from previous session)
          const cachedSession = get().session;
          
          if (!isConnected) {
            // Offline mode - use cached session if available
            if (cachedSession) {
              console.log("📴 Offline mode - using cached session");
              Sentry.captureMessage("Offline mode - using cached session");
              set({ 
                session: cachedSession, 
                isLoadingSession: false, 
                isOfflineMode: true 
              });
            } else {
              console.log("📴 Offline mode - no cached session available");
              set({ 
                session: null, 
                isLoadingSession: false, 
                isOfflineMode: true 
              });
            }
            return;
          }
          
          // Online mode - try to get fresh session from Supabase
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              // Network error but we have connection - might be Supabase issue
              // Fallback to cached session if available
              if (cachedSession) {
                console.log("⚠️ Server error - using cached session as fallback");
                Sentry.captureMessage("Server error - using cached session: " + error.message);
                set({ 
                  session: cachedSession, 
                  isLoadingSession: false, 
                  isOfflineMode: true 
                });
              } else {
                Sentry.captureException(error);
                set({ 
                  session: null, 
                  isLoadingSession: false, 
                  isOfflineMode: false 
                });
              }
              return;
            }
            
            // Successfully got session from server
            if (session) {
              console.log("✅ Online mode - fresh session loaded");
              Sentry.captureMessage("Fresh session loaded from server");
              set({ 
                session, 
                isLoadingSession: false, 
                isOfflineMode: false 
              });
            } else if (cachedSession) {
              // No server session but have cached - might be expired
              console.log("🗑️ No server session - clearing expired cache");
              set({ 
                session: null, 
                user: null, 
                isLoadingSession: false, 
                isOfflineMode: false 
              });
            } else {
              set({ 
                session: null, 
                isLoadingSession: false, 
                isOfflineMode: false 
              });
            }
            
            // Setup auth state change listener (only when online)
            supabase.auth.onAuthStateChange((_event, session) => {
              console.log("🔄 Auth state changed:", _event);
              set({ session, isOfflineMode: false });
              if (!session) {
                set({ user: null });
              }
            });
          } catch (networkError) {
            // Network error during fetch - use cached session if available
            if (cachedSession) {
              console.log("📴 Network error - falling back to cached session");
              Sentry.captureMessage("Network error - using cached session for offline mode");
              set({ 
                session: cachedSession, 
                isLoadingSession: false, 
                isOfflineMode: true 
              });
            } else {
              console.error("❌ Network error and no cached session");
              Sentry.captureException(networkError);
              set({ 
                session: null, 
                isLoadingSession: false, 
                isOfflineMode: true 
              });
            }
          }
        } catch (error) {
          Sentry.captureException(error);
          set({ 
            session: null, 
            isLoadingSession: false, 
            isOfflineMode: false 
          });
        }
        set({ isLoadingSession: false });
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
        session: state.session, // Persist session for offline mode
      }),
    }
  )
);
