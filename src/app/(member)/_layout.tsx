import { Stack } from 'expo-router';

import { AppHeader } from '@/components/layout/app-header';
import { palette } from '@/theme/tokens';

/** Member area: the tab shell `(tabs)` plus a stack of member screens (folder `member/`). */
export default function MemberLayout() {
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
