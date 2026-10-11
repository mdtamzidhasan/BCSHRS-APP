import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { FlowShell } from '@/features/auth-flows/components/flow-shell';
import { WizardView } from '@/features/auth-flows/components/wizard-view';
import { useWizard } from '@/features/auth-flows/use-wizard';
import { spacing } from '@/theme/tokens';

/** Account activation: user name or email, Email / Mobile, verification code, finish. */
export default function VerifyAccountScreen() {
  const router = useRouter();
  const wizard = useWizard('verify', { onFinished: () => router.replace('/login') });

  return (
    <FlowShell title="Verify Account">
      <WizardView
        wizard={wizard}
        identifyLabel="User name or email"
        done={
          <>
            <AppText tone="success" style={styles.gap}>
              Your account has been successfully verified.
            </AppText>
            <Button title="Finish" loading={wizard.pending} onPress={wizard.finish} />
          </>
        }
      />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.md },
});
