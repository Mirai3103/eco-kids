import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Baloo2_600SemiBold, useFonts as useBalooFonts } from '@expo-google-fonts/baloo-2';
import { NunitoSans_400Regular, useFonts as useNunitoFonts } from '@expo-google-fonts/nunito-sans';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [balooLoaded] = useBalooFonts({
    Baloo2_600SemiBold,
  });
  const [nunitoLoaded] = useNunitoFonts({
    NunitoSans_400Regular,  
  });  

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
