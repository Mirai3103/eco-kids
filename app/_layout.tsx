import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import ReactQueryProvider from "@/lib/react-query";
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
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [balooLoaded] = useBalooFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold
  });
  const [nunitoLoaded] = useNunitoFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_600SemiBold
  });

  if (!balooLoaded || !nunitoLoaded) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="stories/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" backgroundColor="transparent" translucent />
        </ThemeProvider>
      </GluestackUIProvider>
    </ReactQueryProvider>
  );
}
