import "react-native-gesture-handler";
import "react-native-reanimated";

import FloatingAssistant from "@/components/FloatingAssistant";
import LoadingScreen from "@/components/LoadingScreen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import useSession from "@/hooks/useSession";
import ReactQueryProvider from "@/lib/react-query";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/user.store";
import { useSoundStore } from "@/stores/useSoundStore";
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
import { SplashScreen, Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();
const bgm = require('@/assets/audio/bgm.mp3');
export default function RootLayout() {
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
  const { setUser} =useUserStore()
  const init = useSoundStore((s) => s.init);
  const unload = useSoundStore((s) => s.unloadAll);
  const register = useSoundStore((s) => s.register);
  const play = useSoundStore((s) => s.play);

  useEffect(() => {
    init();
    register({
      key: 'bgm',
      source: bgm,
      type: 'theme',
      config:{
        volume: 0.15,
        loop: true,
      }
    });
    // play('bgm');
    return () => { unload(); };
  }, []);
  React.useEffect(() => {
    console.log("session", session);
    console.log("isLoading", isLoading);
    if (isLoading) return;
    if (!session && pathname !== "/login") {
      router.replace("/login");
      return;
    }
    if (session) {
      setUser({
        avatar : session.user.user_metadata.avatar_url.replace(/=s\d+-c/, '=s256-c'),
        name : session.user.user_metadata.name,
        id : session.user.id,
        isGuest : false,
      });
      supabase.from('users').select('*').eq('id', session.user.id).single().then((res) => {
        setUser({
          avatar : session.user.user_metadata.avatar_url.replace(/=s\d+-c/, '=s256-c'),
          name : session.user.user_metadata.name,
          id : session.user.id,
          isGuest : false,
          points : res.data?.points ||0,
        });
      });
    }
  }, [session, isLoading]);
  if (!balooLoaded || !nunitoLoaded) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReactQueryProvider>
        <GluestackUIProvider mode="light">
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="stories/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="stories/[id]/read"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="topics/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="stories/[id]/quiz" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="history" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" backgroundColor="transparent" translucent />
            {session && pathname !== "/login" && <FloatingAssistant />}
          </ThemeProvider>
        </GluestackUIProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}
