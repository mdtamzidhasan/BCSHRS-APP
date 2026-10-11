import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { palette } from '@/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

/** Title + outline/filled icon pair of one bottom tab. */
export const tabOptions = (title: string, icon: IconName, iconActive: IconName) => ({
  title,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => <Ionicons name={focused ? iconActive : icon} size={size} color={color as string} />,
});

/** The tab bar look shared by the admin and member shells. */
export const tabBarScreenOptions = {
  tabBarActiveTintColor: palette.primary,
  tabBarInactiveTintColor: palette.textMuted,
  tabBarLabelStyle: { fontSize: 11 },
  tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border },
} as const;
