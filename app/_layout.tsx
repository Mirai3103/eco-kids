import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Baloo2_600SemiBold,
  useFonts as useBalooFonts,
} from "@expo-google-fonts/baloo-2";
import {
  NunitoSans_400Regular,
  useFonts as useNunitoFonts,
} from "@expo-google-fonts/nunito-sans";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
const queryClient = new QueryClient();
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [balooLoaded] = useBalooFonts({
    Baloo2_600SemiBold,
  });
  const [nunitoLoaded] = useNunitoFonts({
    NunitoSans_400Regular,
  });

  if (!balooLoaded || !nunitoLoaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" backgroundColor="transparent" translucent />
        </ThemeProvider>
      </GluestackUIProvider>
    </PersistQueryClientProvider>
  );
}
