import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Check once on mount — never re-run on segment changes.
  // Onboarding calls router.replace('/(tabs)') itself when done.
  useEffect(() => {
    AsyncStorage.getItem('mindfuel_onboarded').then((val) => {
      setReady(true);
      if (val !== 'true') {
        router.replace('/onboarding');
      }
      // If already onboarded, expo-router's default route (index) loads normally.
    });
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="category/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
