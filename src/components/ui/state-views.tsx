import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ApiError, toApiError } from '@/api/errors';
import { palette, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import { Button } from './button';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={palette.primary} />
      <AppText tone="muted" style={styles.gap}>
        {label}
      </AppText>
    </View>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, icon = 'file-tray-outline' }: { title?: string; message?: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={44} color={palette.textMuted} />
      <AppText variant="subheading" style={styles.gap}>
        {title}
      </AppText>
      {message ? (
        <AppText tone="muted" style={styles.text}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

/** A failed request: the server's own message, a permission hint on 403, and Retry. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const failure: ApiError = toApiError(error);
  const denied = failure.status === 403;

  return (
    <View style={styles.center}>
      <Ionicons name={denied ? 'lock-closed-outline' : 'cloud-offline-outline'} size={44} color={palette.danger} />
      <AppText variant="subheading" style={styles.gap}>
        {denied ? 'No permission' : failure.isNetwork ? 'No connection' : 'Something went wrong'}
      </AppText>
      <AppText tone="muted" style={styles.text}>
        {failure.message}
      </AppText>
      {onRetry && !denied ? <Button title="Try again" variant="secondary" block={false} onPress={onRetry} style={styles.gap} /> : null}
    </View>
  );
}

/** An inline form-level error (the first message of a failed save). */
export function FormError({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle" size={18} color={palette.danger} />
      <AppText tone="danger" style={styles.bannerText}>
        {toApiError(error).message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, minHeight: 220 },
  gap: { marginTop: spacing.md },
  text: { textAlign: 'center', marginTop: spacing.xs },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.dangerSoft, padding: spacing.md, borderRadius: 10, marginBottom: spacing.md },
  bannerText: { flex: 1 },
});
