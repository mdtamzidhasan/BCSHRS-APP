import { Pressable, StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import type { Option } from './select-field';

interface Props<T extends string | number> {
  label?: string;
  value: T | null | undefined;
  options: Option<T>[];
  onChange: (value: T) => void;
  error?: string;
}

/** Radio buttons that wrap onto as many rows as needed (Single Employee / All Employee / Department …). */
export function RadioGroup<T extends string | number>({ label, value, options, onChange, error }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={styles.option}>
              <View style={[styles.circle, selected && styles.circleSelected]}>{selected ? <View style={styles.dot} /> : null}</View>
              <AppText style={styles.text}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: palette.textMuted, alignItems: 'center', justifyContent: 'center' },
  circleSelected: { borderColor: palette.accent },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.accent },
  text: { fontSize: 14 },
});
