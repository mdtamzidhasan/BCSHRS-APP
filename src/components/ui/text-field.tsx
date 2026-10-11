import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** The message the server gave for this field (422 `errors.<field>`). */
  error?: string;
  hint?: string;
  /** Adds the show / hide toggle of a password input. */
  password?: boolean;
}

export function TextField({ label, error, hint, password, multiline, ...input }: Props) {
  const [hidden, setHidden] = useState(!!password);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={[styles.box, focused && styles.focused, !!error && styles.errored]}>
        <TextInput
          {...input}
          multiline={multiline}
          secureTextEntry={hidden}
          autoCapitalize={input.autoCapitalize ?? 'none'}
          placeholderTextColor={palette.textMuted}
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          style={[styles.input, multiline && styles.multiline]}
        />
        {password ? (
          <Pressable accessibilityLabel={hidden ? 'Show password' : 'Hide password'} onPress={() => setHidden((value) => !value)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={palette.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.message}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="muted" style={styles.message}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  focused: { borderColor: palette.primary },
  errored: { borderColor: palette.danger },
  input: { flex: 1, minHeight: 46, color: palette.text, fontSize: 15 },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md },
  message: { marginTop: spacing.xs },
});
