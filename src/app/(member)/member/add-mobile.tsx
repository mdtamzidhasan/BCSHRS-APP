import { Stack } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useAddMobile } from '@/features/member/use-member';

export default function AddMobileScreen() {
  const form = useAddMobile();

  return (
    <Screen refreshing={form.current.isRefetching} onRefresh={() => void form.current.refetch()}>
      <Stack.Screen options={{ title: 'Add Mobile Number' }} />
      <Card outlined>
        <AppText tone="muted">{form.current.data ? `Current mobile number: ${form.current.data}` : 'No valid mobile number is registered yet.'}</AppText>
        <FormError error={form.mutation.error && !form.errors.field('mobile') ? form.mutation.error : null} />
        <TextField label="Mobile Number" keyboardType="phone-pad" placeholder="01XXXXXXXXX" value={form.mobile} onChangeText={form.setMobile} error={form.errors.field('mobile')} />
        <Button title="Save" loading={form.mutation.isPending} disabled={form.mobile.trim() === ''} onPress={form.submit} />
      </Card>
    </Screen>
  );
}
