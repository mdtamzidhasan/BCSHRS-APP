import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

export type ViewMode = 'card' | 'table';

interface Props {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS: { mode: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'card', label: 'Card', icon: 'albums-outline' },
  { mode: 'table', label: 'Table', icon: 'grid-outline' },
];

/** Segmented "Card | Table" switch for a list that can be shown either way. */
export function ViewToggle({ value, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {OPTIONS.map(({ mode, label, icon }) => {
        const active = mode === value;

        return (
          <Pressable key={mode} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(mode)} style={[styles.option, active && styles.optionActive]}>
            <Ionicons name={icon} size={16} color={active ? palette.white : palette.primary} />
            <AppText weight="medium" style={{ color: active ? palette.white : palette.primary, fontSize: 14 }}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignSelf: 'flex-start', borderWidth: 1, borderColor: palette.primary, borderRadius: radius.md, overflow: 'hidden', backgroundColor: palette.surface },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
  optionActive: { backgroundColor: palette.primary },
});
