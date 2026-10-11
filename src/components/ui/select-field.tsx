import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

export interface Option<T extends string | number = string> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  label?: string;
  value: T | null | undefined;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

/** A drop-down: the field shows the chosen label; tapping opens a bottom sheet list. */
export function SelectField<T extends string | number>({ label, value, options, onChange, placeholder = 'Select', error, disabled }: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.box, !!error && styles.errored, disabled && styles.disabled]}>
        <AppText tone={selected ? 'default' : 'muted'} numberOfLines={1} style={styles.value}>
          {selected?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={palette.textMuted} />
      </Pressable>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.message}>
          {error}
        </AppText>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <AppText variant="subheading" style={styles.sheetTitle}>
            {label ?? placeholder}
          </AppText>
          <FlatList
            data={options}
            keyExtractor={(option) => String(option.value)}
            ListEmptyComponent={<AppText tone="muted">No options available.</AppText>}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={styles.option}>
                <AppText weight={item.value === value ? 'bold' : 'regular'} tone={item.value === value ? 'primary' : 'default'} style={styles.value}>
                  {item.label}
                </AppText>
                {item.value === value ? <Ionicons name="checkmark" size={18} color={palette.primary} /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  errored: { borderColor: palette.danger },
  disabled: { opacity: 0.55 },
  value: { flex: 1 },
  message: { marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: palette.overlay },
  sheet: {
    maxHeight: '60%',
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetTitle: { marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
});
