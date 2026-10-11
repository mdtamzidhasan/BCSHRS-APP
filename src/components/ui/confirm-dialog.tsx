import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import { Button } from './button';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before a delete or any action that cannot be undone. */
export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', destructive, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.dialog}>
          <AppText variant="subheading">{title}</AppText>
          {message ? (
            <AppText tone="muted" style={styles.message}>
              {message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" block={false} onPress={onCancel} style={styles.action} />
            <Button title={confirmLabel} variant={destructive ? 'danger' : 'primary'} block={false} loading={loading} onPress={onConfirm} style={styles.action} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: palette.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  dialog: { width: '100%', maxWidth: 420, backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.xl },
  message: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl },
  action: { minWidth: 96 },
});
