import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MissionProvider } from '../game/store';
import { color } from '../theme/tokens';
import { zap } from '../theme/zap';
import { fontAssets } from '../theme/type';
import { ZapBridge } from '../zap/Bridge';
import { ZapProvider } from '../zap/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <ZapProvider>
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
            <Stack.Screen name="zap/index" options={{ animation: 'none', contentStyle: { backgroundColor: zap.list } }} />
            <Stack.Screen name="zap/[chat]" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: zap.bg } }} />
            <Stack.Screen name="zap/invasao" options={{ gestureEnabled: false, animation: 'none' }} />
            <Stack.Screen name="zap/video/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
            <Stack.Screen name="home" options={{ gestureEnabled: false }} />
            <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="verify" options={{ gestureEnabled: false }} />
            <Stack.Screen name="clue/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="complete" options={{ gestureEnabled: false }} />
            <Stack.Screen name="hack/[stage]" options={{ gestureEnabled: false, animation: 'none' }} />
          </Stack>
          <ZapBridge />
        </MissionProvider>
      </ZapProvider>
    </SafeAreaProvider>
  );
}
