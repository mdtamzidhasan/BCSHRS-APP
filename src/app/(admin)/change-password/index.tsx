import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { toast } from '@/components/ui/toast';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useChangePassword } from '@/features/admin-home/use-admin-home';

/** Admin change password. On success the API revokes the token, so the message is shown and the session ends. */
export default function AdminChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const mutation = useChangePassword();
  const errors = useFormErrors(mutation.error);

  const submit = () =>
    mutation.mutate(
      { current_password: current, new_password: next, new_password_confirmation: confirm },
      { onSuccess: (response) => toast.success(response.message || 'Your password has been changed successfully') },
    );

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Change Password' }} />
      <Card>
        <TextField label="Current Password" password value={current} onChangeText={setCurrent} error={errors.field('current_password')} autoCapitalize="none" />
        <TextField
          label="New Password"
          password
          value={next}
          onChangeText={setNext}
          error={errors.field('new_password')}
          hint="At least 8 characters with upper and lower case letters, a number and one of @ # $ % ^ + ="
          autoCapitalize="none"
        />
        <TextField label="Confirm New Password" password value={confirm} onChangeText={setConfirm} error={errors.field('new_password_confirmation')} autoCapitalize="none" />
        {errors.general ? <FormError error={mutation.error} /> : null}
        <Button title="Change Password" loading={mutation.isPending} disabled={!current || !next || !confirm} onPress={submit} />
      </Card>
    </Screen>
  );
}
