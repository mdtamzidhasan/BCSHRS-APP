import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { useAuth } from '@/hooks/use-auth';
import { palette, spacing } from '@/theme/tokens';

import { BrandMark } from './brand-mark';
import { useSideMenu } from './side-menu';

interface Props {
  title?: string;
  /** Show a back arrow instead of the hamburger (stack screens). */
  back?: boolean;
  suffix?: string;
}

/** The top bar of the design: hamburger, wordmark, user avatar. Stack screens show a back arrow and the screen title. */
export function AppHeader({ title, back, suffix }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openMenu = useSideMenu((state) => state.open);
  const { user } = useAuth();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable accessibilityLabel={back ? 'Go back' : 'Open menu'} hitSlop={12} onPress={back ? () => router.back() : openMenu}>
        <Ionicons name={back ? 'chevron-back' : 'menu'} size={26} color={palette.text} />
      </Pressable>
      <View style={styles.center}>
        {title ? (
          <AppText variant="subheading" numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          <BrandMark suffix={suffix} />
        )}
      </View>
      <View style={styles.avatar} accessibilityLabel={`Signed in as ${user?.username ?? ''}`}>
        <Ionicons name="person" size={16} color={palette.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  center: { flex: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' },
});
