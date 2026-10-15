import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLoginForm } from '@/features/auth/use-login';
import { BrandMark } from '@/components/layout/brand-mark';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { RadioGroup } from '@/components/ui/radio-group';
import { palette, spacing } from '@/theme/tokens';

import type { Area } from '@/lib/secure-storage';

/** Login — the Member / Admin choice, credentials, then the OTP step when the server asks for one. */
export default function LoginScreen() {
  const router = useRouter();
  const [area, setArea] = useState<Area>('member');
  const [companyCode, setCompanyCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { submit, pending, errors, endedReason } = useLoginForm((challenge) =>
    router.push({ pathname: '/verify', params: { area: challenge.area, challengeId: challenge.challengeId, channels: challenge.channels.join(',') } }),
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <View style={styles.brand}>
            <BrandMark size={36} />
            <AppText tone="muted">Human Resource Management System</AppText>
          </View>

          <Card>
            <AppText variant="heading" style={styles.heading}>
              Log in
            </AppText>
            {endedReason ? (
              <AppText tone="danger" style={styles.reason}>
                {endedReason}
              </AppText>
            ) : null}

            <RadioGroup
              value={area}
              onChange={setArea}
              options={[
                { label: 'Member', value: 'member' },
                { label: 'Admin', value: 'admin' },
              ]}
            />

            {area === 'admin' ? <TextField label="Company code" value={companyCode} onChangeText={setCompanyCode} error={errors.field('company_code')} autoCapitalize="characters" /> : null}
            <TextField label="User name" value={username} onChangeText={setUsername} error={errors.field('username')} autoCorrect={false} />
            <TextField label="Password" value={password} onChangeText={setPassword} error={errors.field('password')} password />

            {errors.general ? <FormError error={new Error(errors.general)} /> : null}
            {errors.retryAfter ? (
              <AppText variant="caption" tone="muted" style={styles.reason}>
                Try again in {errors.retryAfter} seconds.
              </AppText>
            ) : null}

            <Button title="Log in" loading={pending} onPress={() => submit(area, { username, password, company_code: area === 'admin' ? companyCode : undefined })} />

            <View style={styles.links}>
              <Button title="Forgot password?" variant="ghost" block={false} size="sm" onPress={() => router.push({ pathname: '/forgot-password', params: { area } })} />
              {area === 'member' ? <Button title="Register" variant="ghost" block={false} size="sm" onPress={() => router.push('/register')} /> : null}
            </View>
            {area === 'member' ? <Button title="Verify account" variant="ghost" block={false} size="sm" onPress={() => router.push('/verify-account')} /> : null}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  brand: { alignItems: 'center', gap: spacing.xs },
  heading: { marginBottom: spacing.md },
  reason: { marginBottom: spacing.md },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
});
