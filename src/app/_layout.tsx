import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { FloatingHeartsProvider } from '@/components/FloatingHearts';
import { ToastProvider } from '@/components/Toast';
import { AppStateProvider } from '@/state/AppState';
import { color } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AppStateProvider>
      <ToastProvider>
        <FloatingHeartsProvider>
          <StatusBar style="dark" />
          {/* screens animate themselves in (Screen.tsx), like the prototype */}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor: color.cream },
            }}
          />
        </FloatingHeartsProvider>
      </ToastProvider>
    </AppStateProvider>
  );
}
