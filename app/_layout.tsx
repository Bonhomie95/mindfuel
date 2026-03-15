import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLoadingScreen from '../components/AppLoadingScreen';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function AppNavigator() {
  const { theme } = useTheme();
  const router = useRouter();
  const navigated = useRef(false);
  const [showLoader, setShowLoader] = useState(true);

  // Use a ref so handleLoaderDone always reads the LATEST value,
  // not the stale value captured at the time the function was created.
  const onboardedRef = useRef<boolean | null>(null);
  const appReadyRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem('mindfuel_onboarded').then((val) => {
      onboardedRef.current = val === 'true';
      appReadyRef.current = true;
    });
  }, []);

  const handleLoaderDone = () => {
    setShowLoader(false);
    // onboardedRef.current is always current — no stale closure
    if (onboardedRef.current === false && !navigated.current) {
      navigated.current = true;
      setTimeout(() => router.replace('/onboarding'), 0);
    }
    // If onboardedRef.current is true or null (still loading), stay on tabs/index
  };

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="category/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>

      {showLoader && (
        <AppLoadingScreen
          onDone={handleLoaderDone}
          minDuration={1500}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
