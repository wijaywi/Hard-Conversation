import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LogLevel } from 'react-native-purchases';

// API Keys should ideally come from .env in production
const APIKeys = {
  apple: "appl_YOUR_APPLE_API_KEY",
  google: "goog_YOUR_GOOGLE_API_KEY"
};

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log("RevenueCat is not supported on web. Skipping initialization.");
      return;
    }

    try {
      Purchases.setLogLevel(LogLevel.Debug);
      
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: APIKeys.apple });
      } else if (Platform.OS === 'android') {
        Purchases.configure({ apiKey: APIKeys.google });
      }
    } catch (e) {
      console.warn("Failed to initialize RevenueCat:", e);
    }
  }, []);

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'SCENARIOS' }} />
        <Stack.Screen name="scenario/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="evaluation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
