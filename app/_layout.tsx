import { CircularRevealOverlay } from "@/components/CircularRevealOverlay";
import LoadingScreen from "@/components/LoadingScreen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { CircularRevealProvider } from "@/contexts/CircularRevealContext";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import useSession from "@/hooks/useSession";
import ReactQueryProvider from "@/lib/react-query";
import { supabase } from "@/lib/supabase";
import { useSoundStore } from "@/stores/useSoundStore";
import { useUserStore } from "@/stores/user.store";
import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  useFonts as useBalooFonts,
} from "@expo-google-fonts/baloo-2";
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts as useNunitoFonts,
} from "@expo-google-fonts/nunito-sans";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import '../lib/poly-fill';

import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "@/stores/db";
import migrations from "../drizzle/migrations";
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
const isProduction = Constants.expoConfig?.extra?.isProduction;

ToastAndroid.show("isProduction: " + isProduction, ToastAndroid.LONG);
if (isProduction) {
  Sentry.init({
    dsn: "https://94a5775dcbc7c7f8a38c0717d22be979@o4510369999486976.ingest.us.sentry.io/4510370002239488",

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });
}

const bgm = require("@/assets/audio/bgm.mp3");
 function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  useEffect(() => {
    if (success) {
      Sentry.captureMessage("Migrations successful");
    }
    if (error) {
      Sentry.captureException(error);
    }
  }, [success, error]);
  const colorScheme = useColorScheme();
  const [balooLoaded] = useBalooFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
  });
  const [nunitoLoaded] = useNunitoFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_600SemiBold,
  });
  const { session, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, user } = useUserStore();
  const init = useSoundStore((s) => s.init);
  const unload = useSoundStore((s) => s.unloadAll);
  const register = useSoundStore((s) => s.register);
  const play = useSoundStore((s) => s.play);


 
  useEffect(() => {
    init();
    register({
      key: "bgm",
      source: bgm,
      type: "theme",
      config: {
        volume: 0.15,
        loop: true,
      },
    });
    // play('bgm');
    return () => {
      unload();
    };
  }, []);
  React.useEffect(() => {
    // Wait for session to load before doing anything
    if (isLoading) return;

    // Handle authentication routing
    if (!session?.user?.id && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (session?.user?.id && pathname === "/login") {
      router.replace("/");
      return;
    }

    // Initialize user data when session is available and user is not set yet
    if (session?.user && (!user || user.id !== session.user.id)) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata.name,
      });

      // Set initial user data from session
      const initialUserData = {
        avatar: session.user.user_metadata.avatar_url?.replace(
          /=s\d+-c/,
          "=s256-c"
        ) || session.user.user_metadata.avatar_url,
        name: session.user.user_metadata.name,
        id: session.user.id,
        isGuest: false,
      };
      
      setUser(initialUserData);

      // Fetch additional user data from database
      supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()
        .then((res) => {
          if (res.data) {
            setUser({
              ...initialUserData,
              avatar: res.data.avatar_url || initialUserData.avatar,
              points: res.data.points || 0,
            });
          }
          if (res.error) {
            console.error("Error fetching user data:", res.error);
          }
        });
    }
  }, [session, isLoading, pathname]);
  if (!balooLoaded || !nunitoLoaded) {
    Sentry.captureMessage("Fonts not loaded");
    return null;
  }

  if (isLoading) {
    Sentry.captureMessage("Loading screen");
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReactQueryProvider>
        <GluestackUIProvider mode="light">
          <ThemeProvider value={DefaultTheme}>
            <CircularRevealProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="chat"
                  options={{
                    headerShown: false,
                    presentation: "transparentModal",
                    animation: "none",
                  }}
                />
                <Stack.Screen
                  name="stories/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="stories/[id]/read"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen
                  name="topics/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="stories/[id]/quiz"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="history" options={{ headerShown: false }} />
              </Stack>
              <StatusBar
                style="dark"
                backgroundColor="transparent"
                translucent
              />
              {/* {session && pathname !== "/login" && <FloatingAssistant />} */}

              {/* Circular Reveal Overlay */}
              <CircularRevealOverlay />
            </CircularRevealProvider>
          </ThemeProvider>
        </GluestackUIProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}
export default Sentry.wrap(RootLayout);
