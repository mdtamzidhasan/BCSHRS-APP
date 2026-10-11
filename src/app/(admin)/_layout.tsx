import { Stack } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { palette } from '@/theme/tokens';

/**
 * Admin area: the tab shell `(tabs)` plus a stack of feature screens (each folder here is one menu page). Stack screens
 * get the shared header with a back arrow; set `options={{ title: '…' }}` in a screen's own layout to name it.
 */
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <AppHeader back title={options.title} />,
        contentStyle: { backgroundColor: palette.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
