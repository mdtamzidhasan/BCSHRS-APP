import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { FlowShell } from '@/features/auth-flows/components/flow-shell';
import { useResetPassword } from '@/features/auth-flows/use-reset-password';
import { spacing } from '@/theme/tokens';

/** Reset password (params `area`, `id`): the new-password form, then the success state. */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ area?: string; id?: string }>();
  const area = params.area === 'admin' ? 'admin' : 'member';
  const reset = useResetPassword(area, params.id ?? '');

  if (reset.done) {
    return (
      <FlowShell title="Password changed">
        <AppText tone="success" style={styles.gap}>
          Your password has been changed successfully. You can now log in with your new password.
        </AppText>
        <Button title="Go to login" onPress={() => router.replace('/login')} />
      </FlowShell>
    );
  }

  return (
    <FlowShell title="Reset Password">
      {reset.token.isLoading ? <LoadingView /> : null}
      {reset.token.error ? <FormError error={reset.token.error} /> : null}
      {reset.tokenError ? (
        <>
          <AppText tone="danger" style={styles.gap}>
            {reset.tokenError}
          </AppText>
          <Button title="Start again" variant="secondary" onPress={() => router.replace({ pathname: '/forgot-password', params: { area } })} />
        </>
      ) : null}
      {reset.token.data && !reset.tokenError ? (
        <>
          <TextField label="New password" value={reset.password} onChangeText={reset.setPassword} error={reset.errors.field('new_password')} password />
          <TextField label="Confirm new password" value={reset.confirmation} onChangeText={reset.setConfirmation} error={reset.errors.field('new_password_confirmation')} password />
          <AppText variant="caption" tone="muted" style={styles.gap}>
            At least 8 characters with an uppercase letter, a lowercase letter, a digit and a special character (@#$%^+=).
          </AppText>
          {reset.errors.general ? <FormError error={new Error(reset.errors.general)} /> : null}
          <Button title="Change password" loading={reset.pending} onPress={reset.submit} />
        </>
      ) : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.md },
});
