import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { RadioGroup } from '@/components/ui/radio-group';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/theme/tokens';

import type { Channel } from '../api';
import type { useWizard } from '../use-wizard';

interface Props {
  wizard: ReturnType<typeof useWizard>;
  /** Label of the first field ("User name or email" / "User name"). */
  identifyLabel: string;
  /** Rendered in the final step (account verified / reset link sent). */
  done: React.ReactNode;
}

/** Steps 1-3 of the recovery / activation wizard: identify, choose Email or Mobile, enter the code. */
export function WizardView({ wizard, identifyLabel, done }: Props) {
  const [userName, setUserName] = useState('');
  const [channel, setChannel] = useState<Channel>('Email');
  const [code, setCode] = useState('');
  const { errors } = wizard;
  const fieldShown = errors.field('user_name') || errors.field('channel') || errors.field('verification_code');

  return (
    <View>
      {wizard.info ? (
        <AppText tone="success" style={styles.gap}>
          {wizard.info}
        </AppText>
      ) : null}

      {wizard.step === 'user' ? (
        <>
          <TextField label={identifyLabel} value={userName} onChangeText={setUserName} error={errors.field('user_name')} autoCorrect={false} />
          <Button title="Next" loading={wizard.pending} onPress={() => wizard.identify(userName)} />
        </>
      ) : null}

      {wizard.step === 'choose' ? (
        <>
          <AppText tone="muted" style={styles.gap}>
            Where should we send your verification code?
          </AppText>
          <RadioGroup
            value={channel}
            onChange={setChannel}
            error={errors.field('channel')}
            options={[
              { label: 'Email', value: 'Email' as Channel },
              { label: 'Mobile (SMS)', value: 'Mobile' as Channel },
            ]}
          />
          <Button title="Send code" loading={wizard.pending} onPress={() => wizard.send(channel)} />
          <Button title="Start over" variant="ghost" size="sm" onPress={wizard.backToStart} />
        </>
      ) : null}

      {wizard.step === 'code' ? (
        <>
          <TextField label="Verification code" value={code} onChangeText={setCode} error={errors.field('verification_code')} keyboardType="number-pad" autoComplete="one-time-code" />
          <Button title="Verify" loading={wizard.pending} onPress={() => wizard.verify(code)} />
          <View style={styles.row}>
            <Button title="Resend code" variant="ghost" size="sm" block={false} onPress={() => wizard.send(channel)} />
            <Button title="Start over" variant="ghost" size="sm" block={false} onPress={wizard.backToStart} />
          </View>
        </>
      ) : null}

      {wizard.step === 'done' ? done : null}

      {wizard.error && !fieldShown ? <FormError error={wizard.error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
});
