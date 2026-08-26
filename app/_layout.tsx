import {
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts as useBaloo2Fonts,
} from "@expo-google-fonts/baloo-2";
import {
  IBMPlexMono_500Medium,
  useFonts as useIBMPlexMonoFonts,
} from "@expo-google-fonts/ibm-plex-mono";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as usePlusJakartaSansFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AnimatedIntro } from "@/components/ui/AnimatedIntro";
import { AuthProvider } from "@/context/AuthContext";
import { theme } from "@/constants/designTheme";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [introDone, setIntroDone] = useState(false);

  const [baloo2Loaded] = useBaloo2Fonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });
  const [plusJakartaSansLoaded] = usePlusJakartaSansFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [ibmPlexMonoLoaded] = useIBMPlexMonoFonts({ IBMPlexMono_500Medium });
  const fontsLoaded =
    baloo2Loaded && plusJakartaSansLoaded && ibmPlexMonoLoaded;

  // Portrait is the app's default everywhere except Learning Mode, which
  // handles its own landscape lock (and reverts back to this on exit).
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Native splash (Stage 1) has already hidden by this point — this
  // renders in its place immediately, sharing the same paper background,
  // so there's no visible jump between the two. Existing routing (the
  // auth-check redirect in app/index.tsx) only mounts once this finishes.
  if (!introDone) {
    return <AnimatedIntro onFinish={() => setIntroDone(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.indigo },
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.indigo },
              }}
            />
            <Stack.Screen
              name="auth/signup"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.highveld },
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            />
            <Stack.Screen name="learn" options={{ headerShown: false }} />
            <Stack.Screen name="edit-term" options={{ headerShown: false }} />
            <Stack.Screen name="admin/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
