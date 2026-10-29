import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of toggle buttons where exactly one is on (like Card | Table, for any set of options); slides sideways when it does not fit. */
export function SegmentedToggle<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} accessibilityRole="tablist">
      <View style={styles.group}>
        {options.map((option, index) => {
          const active = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              style={[styles.option, index > 0 && styles.divider, active && styles.optionActive]}>
              <AppText weight="medium" style={{ color: active ? palette.white : palette.primary, fontSize: 14 }}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  group: { flexDirection: 'row', borderWidth: 1, borderColor: palette.primary, borderRadius: radius.md, overflow: 'hidden', backgroundColor: palette.surface },
  option: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, minHeight: 40 },
  divider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: palette.primary },
  optionActive: { backgroundColor: palette.primary },
});
