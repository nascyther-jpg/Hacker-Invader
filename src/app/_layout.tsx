import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MissionProvider } from '../game/store';
import { color } from '../theme/tokens';
import { fontAssets } from '../theme/type';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <MissionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: color.bg },
            animation: 'fade',
            animationDuration: 220,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
          <Stack.Screen name="home" options={{ gestureEnabled: false }} />
          <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="verify" options={{ gestureEnabled: false }} />
          <Stack.Screen name="clue/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="complete" options={{ gestureEnabled: false }} />
          <Stack.Screen name="hack/[stage]" options={{ gestureEnabled: false, animation: 'none' }} />
        </Stack>
      </MissionProvider>
    </SafeAreaProvider>
  );
}
