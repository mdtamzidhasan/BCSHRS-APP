import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

type Kind = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  kind: Kind;
  id: number;
  show: (message: string, kind?: Kind) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  kind: 'info',
  id: 0,
  show: (message, kind = 'info') => set((state) => ({ message, kind, id: state.id + 1 })),
  hide: () => set({ message: null }),
}));

/** `toast.success('Saved.')` from anywhere, including mutation callbacks. */
export const toast = {
  success: (message: string) => useToast.getState().show(message, 'success'),
  error: (message: string) => useToast.getState().show(message, 'error'),
  info: (message: string) => useToast.getState().show(message, 'info'),
};

/** Mounted once at the root: a transient banner under the status bar. */
export function ToastHost() {
  const { message, kind, id, hide } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(hide, 3500);

    return () => clearTimeout(timer);
  }, [message, id, hide]);

  if (!message) {
    return null;
  }

  const tone = tones[kind];

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + spacing.sm }]}>
      <View style={[styles.toast, { backgroundColor: tone.background }]}>
        <Ionicons name={tone.icon} size={18} color={palette.white} />
        <AppText tone="inverse" style={styles.text}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

const tones: Record<Kind, { background: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { background: palette.success, icon: 'checkmark-circle' },
  error: { background: palette.danger, icon: 'alert-circle' },
  info: { background: palette.primaryDark, icon: 'information-circle' },
};

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 100 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  text: { flex: 1 },
});
