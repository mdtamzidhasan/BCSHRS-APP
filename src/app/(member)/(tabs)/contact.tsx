import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useContactHr } from '@/features/member/use-member';

/** Member Contact HR: a message is mailed to the HR mailbox together with the employee and company codes. */
export default function MemberContact() {
  const form = useContactHr();

  return (
    <Screen>
      <Card outlined>
        <AppText variant="subheading">Contact HR</AppText>
        <AppText tone="muted">Write your question or comment; HR will receive it with your employee code.</AppText>
        <FormError error={form.mutation.error && !form.errors.field('message') ? form.mutation.error : null} />
        <TextField label="Message" multiline maxLength={2000} value={form.message} onChangeText={form.setMessage} error={form.errors.field('message')} hint={`${form.message.length}/2000`} />
        <Button title="Send" icon="send-outline" loading={form.mutation.isPending} disabled={form.message.trim() === ''} onPress={form.submit} />
      </Card>
    </Screen>
  );
}
