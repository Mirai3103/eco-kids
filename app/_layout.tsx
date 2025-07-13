import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Baloo2_400Regular,
  Baloo2_600SemiBold,
  useFonts as useBalooFonts,
} from "@expo-google-fonts/baloo-2";
import {
  NunitoSans_400Regular,
  useFonts as useNunitoFonts,
} from "@expo-google-fonts/nunito-sans";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Network from "expo-network";

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return eventSubscription.remove;
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [balooLoaded] = useBalooFonts({
    Baloo2_600SemiBold,
    Baloo2_400Regular,
  });
  const [nunitoLoaded] = useNunitoFonts({
    NunitoSans_400Regular,
  });

  if (!balooLoaded || !nunitoLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
