import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/layout/brand-mark';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { toast } from '@/components/ui/toast';
import { useOtpVerification } from '@/features/auth/use-otp';
import type { OtpChannel } from '@/api/auth';
import type { Area } from '@/lib/secure-storage';
import { palette, spacing } from '@/theme/tokens';

const CHANNEL_LABELS: Record<OtpChannel, string> = { email: 'Email', mobile: 'Mobile (SMS)' };

/** Login step 2: choose where the security code goes, then enter it. */
export default function VerifyScreen() {
  const params = useLocalSearchParams<{ area: Area; challengeId: string; channels: string }>();
  const router = useRouter();
  const channels = (params.channels ?? '').split(',').filter(Boolean) as OtpChannel[];
  const [channel, setChannel] = useState<OtpChannel>(channels[0] ?? 'email');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const otp = useOtpVerification(params.area, params.challengeId);

  const send = async () => {
    const message = await otp.send(channel);

    if (message !== undefined) {
      setSent(true);
      toast.success(message ?? 'Security code sent.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <BrandMark size={30} />
        <Card>
          <AppText variant="heading" style={styles.gap}>
            Security code
          </AppText>
          <RadioGroup label="Send the code to" value={channel} onChange={setChannel} options={channels.map((value) => ({ label: CHANNEL_LABELS[value], value }))} />
          <Button title={sent ? 'Send again' : 'Send code'} variant="secondary" loading={otp.sending} onPress={send} style={styles.gap} />
          <FormError error={otp.sendError} />

          {sent ? (
            <>
              <TextField label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" error={otp.errors.field('verification_code')} />
              <FormError error={otp.verifyError} />
              <Button title="Verify" loading={otp.verifying} onPress={() => otp.verify(code)} />
            </>
          ) : null}

          <Button title="Back to login" variant="ghost" block={false} size="sm" onPress={() => router.back()} style={styles.gap} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl, alignItems: 'stretch' },
  gap: { marginVertical: spacing.sm },
});
