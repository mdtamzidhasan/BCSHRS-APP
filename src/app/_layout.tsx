import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/query-client';
import { PrivacyGuard } from '@/components/layout/privacy-guard';
import { SideMenu } from '@/components/layout/side-menu';
import { ToastHost } from '@/components/ui/toast';
import { secureStorage } from '@/lib/secure-storage';
import { useSession } from '@/store/session';

SplashScreen.preventAutoHideAsync();

/** Reads the stored session once at start; until it is known the splash screen stays up. */
async function restoreSession() {
  const stored = await secureStorage.loadSession();

  if (stored) {
    useSession.getState().setSession({ area: stored.area, accessToken: stored.accessToken, refreshToken: stored.refreshToken, user: stored.user });
  } else {
    useSession.getState().markUnauthenticated();
  }
}

export default function RootLayout() {
  const status = useSession((state) => state.status);
  const area = useSession((state) => state.area);

  useEffect(() => {
    void restoreSession().finally(() => SplashScreen.hideAsync());
  }, []);

  // A finished session must not leave the previous user's cached data behind.
  useEffect(() => {
    if (status === 'unauthenticated') {
      queryClient.clear();
    }
  }, [status]);

  if (status === 'booting') {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={status === 'unauthenticated'}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'authenticated' && area === 'admin'}>
            <Stack.Screen name="(admin)" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'authenticated' && area === 'member'}>
            <Stack.Screen name="(member)" />
          </Stack.Protected>
        </Stack>
        <SideMenu />
        <ToastHost />
        <PrivacyGuard />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
