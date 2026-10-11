import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  /** Right-side content; a chevron is shown when the row is pressable and nothing is given. */
  trailing?: React.ReactNode;
  destructive?: boolean;
}

/** A tappable row for menus and settings (the mobile form of a sidebar item). */
export function ListRow({ title, subtitle, icon, onPress, trailing, destructive }: Props) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {icon ? (
        <View style={[styles.icon, destructive && styles.iconDestructive]}>
          <Ionicons name={icon} size={20} color={destructive ? palette.danger : palette.primary} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText weight="medium" tone={destructive ? 'danger' : 'default'}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={palette.textMuted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, padding: spacing.md },
  pressed: { backgroundColor: palette.primarySoft },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconDestructive: { backgroundColor: palette.dangerSoft },
  text: { flex: 1 },
});
