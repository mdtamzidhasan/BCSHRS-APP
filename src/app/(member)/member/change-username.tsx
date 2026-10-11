import { Stack } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useChangeUsername } from '@/features/member/use-member';

export default function ChangeUsernameScreen() {
  const form = useChangeUsername();
  const { user, logout } = useAuth();
  const done = form.mutation.isSuccess;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Change User Name' }} />
      <Card outlined>
        {done ? (
          <>
            <AppText>{form.mutation.data?.message}</AppText>
            <Button title="Log out now" onPress={() => void logout()} />
          </>
        ) : (
          <>
            <FormError error={form.mutation.error && !form.errors.field('new_username') ? form.mutation.error : null} />
            <TextField label="Current User Name" value={user?.username ?? ''} editable={false} />
            <TextField label="New User Name" autoCapitalize="none" autoCorrect={false} value={form.username} onChangeText={form.setUsername} error={form.errors.field('new_username')} />
            <Button title="Change User Name" loading={form.mutation.isPending} disabled={form.username.trim() === ''} onPress={form.submit} />
          </>
        )}
      </Card>
    </Screen>
  );
}
