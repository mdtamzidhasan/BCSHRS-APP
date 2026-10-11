import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { FlowShell } from '@/features/auth-flows/components/flow-shell';
import { WizardView } from '@/features/auth-flows/components/wizard-view';
import { useWizard } from '@/features/auth-flows/use-wizard';
import { spacing } from '@/theme/tokens';

const UUID = /[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/i;

/** Forgot password (param `area` = member | admin): identify, choose channel, verify code, then reset. */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area?: string }>();
  const kind = area === 'admin' ? 'admin' : 'member';
  const [link, setLink] = useState('');
  const wizard = useWizard(kind, { onReset: (id) => router.replace({ pathname: '/reset-password', params: { area: kind, id } }) });

  const openReset = () => {
    const id = link.match(UUID)?.[0];

    if (id) {
      router.replace({ pathname: '/reset-password', params: { area: kind, id } });
    }
  };

  return (
    <FlowShell title={kind === 'admin' ? 'Admin: Recover Password' : 'Recover Password'}>
      <WizardView
        wizard={wizard}
        identifyLabel={kind === 'admin' ? 'User name' : 'User name or email'}
        done={
          <>
            <AppText tone="muted" style={styles.gap}>
              Open the reset link we e-mailed you and paste it (or just its ID) below to set a new password.
            </AppText>
            <TextField label="Reset link or ID" value={link} onChangeText={setLink} autoCorrect={false} />
            <Button title="Continue" disabled={!UUID.test(link)} onPress={openReset} />
          </>
        }
      />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.md },
});
