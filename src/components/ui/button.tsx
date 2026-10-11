import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

type Variant = 'primary' | 'info' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width (default). Turn off for inline buttons. */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The one button of the app: teal primary, blue info (card "Details"), outline, danger and text-only. */
export function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, block = true, style }: Props) {
  const inactive = disabled || loading;
  const colors = palettes[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        block ? styles.block : styles.inline,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={colors.text} /> : null}
          <AppText weight="medium" style={{ color: colors.text, fontSize: size === 'sm' ? 13 : 15 }}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const palettes: Record<Variant, { background: string; border: string; text: string }> = {
  primary: { background: palette.primary, border: palette.primary, text: palette.white },
  info: { background: palette.info, border: palette.info, text: palette.white },
  secondary: { background: palette.surface, border: palette.primary, text: palette.primary },
  danger: { background: palette.danger, border: palette.danger, text: palette.white },
  ghost: { background: 'transparent', border: 'transparent', text: palette.primary },
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  md: { minHeight: 46, paddingHorizontal: spacing.lg },
  sm: { minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  block: { alignSelf: 'stretch' },
  inline: { alignSelf: 'flex-start' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
