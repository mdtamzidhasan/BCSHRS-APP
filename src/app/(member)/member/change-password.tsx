import { Stack } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useChangePassword } from '@/features/member/use-member';

export default function ChangePasswordScreen() {
  const form = useChangePassword();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Change Password' }} />
      <Card outlined>
        <FormError error={form.mutation.error && !form.errors.field('old_password') && !form.errors.field('new_password') ? form.mutation.error : null} />
        <TextField label="Current Password" password value={form.values.old_password} onChangeText={(text) => form.set('old_password', text)} error={form.errors.field('old_password')} />
        <TextField label="New Password" password value={form.values.new_password} onChangeText={(text) => form.set('new_password', text)} error={form.errors.field('new_password')} />
        <TextField label="Confirm New Password" password value={form.values.new_password_confirmation} onChangeText={(text) => form.set('new_password_confirmation', text)} />
        <AppText variant="caption" tone="muted">
          At least 8 characters with an upper-case letter, a lower-case letter, a number and one of @ # $ % ^ + =.
        </AppText>
        <Button title="Change Password" loading={form.mutation.isPending} onPress={form.submit} />
      </Card>
    </Screen>
  );
}
