import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { SwitchRow } from '@/components/ui/misc';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { FlowShell } from '@/features/auth-flows/components/flow-shell';
import { useRegister } from '@/features/auth-flows/use-register';
import { spacing } from '@/theme/tokens';

/** Member registration with the math captcha. */
export default function RegisterScreen() {
  const router = useRouter();
  const r = useRegister(() => router.replace('/login'));

  return (
    <FlowShell title="Register">
      <TextField label="User name" value={r.form.username} onChangeText={r.set('username')} error={r.errors.field('username')} autoCorrect={false} />
      <TextField label="Employee ID" value={r.form.employee_id} onChangeText={r.set('employee_id')} error={r.errors.field('employee_id')} autoCorrect={false} />
      <TextField label="Company code" value={r.form.company_code} onChangeText={r.set('company_code')} error={r.errors.field('company_code')} autoCapitalize="characters" />
      <TextField label="Email" value={r.form.email} onChangeText={r.set('email')} error={r.errors.field('email')} keyboardType="email-address" />
      <TextField label="Password" value={r.form.password} onChangeText={r.set('password')} error={r.errors.field('password')} hint="8-15 characters: upper, lower, digit and one of @#$%^+=" password />
      <TextField label="Confirm password" value={r.form.password_confirmation} onChangeText={r.set('password_confirmation')} password />

      <AppText variant="label" style={styles.question}>
        Captcha: {r.captcha.isFetching ? 'loading…' : (r.captcha.data ?? 'unavailable')}
      </AppText>
      <TextField value={r.form.captcha} onChangeText={r.set('captcha')} error={r.errors.field('captcha')} keyboardType="number-pad" placeholder="Your answer" />
      <View style={styles.refresh}>
        <Button title="New question" icon="refresh" variant="secondary" size="sm" block={false} loading={r.captcha.isFetching} onPress={() => void r.captcha.refetch()} />
      </View>

      <SwitchRow label="I accept the terms and conditions" value={r.terms} onChange={r.setTerms} />
      {r.errors.field('terms') ? (
        <AppText variant="caption" tone="danger">
          {r.errors.field('terms')}
        </AppText>
      ) : null}

      {r.errors.general ? <FormError error={new Error(r.errors.general)} /> : null}
      <Button title="Create account" loading={r.pending} onPress={r.submit} />
      <Button title="Verify an existing account" variant="ghost" size="sm" onPress={() => router.push('/verify-account')} />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  question: { marginBottom: spacing.xs },
  refresh: { alignItems: 'flex-start', marginBottom: spacing.md },
});
