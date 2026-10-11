import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';

import type { WebEvent, WebEventInput } from '../api';
import { useSaveWebEvent } from '../use-catalogue';

/** Create / edit one web event (Form Name, Action Name, Description). `id` is set when editing. */
export function WebEventForm({ id, event }: { id?: string; event?: WebEvent }) {
  const [form, setForm] = useState<WebEventInput>({ FormName: event?.FormName ?? '', ActionName: event?.ActionName ?? '', Description: event?.Description ?? '' });
  const save = useSaveWebEvent(id);
  const errors = useFormErrors(save.error);
  const set = (name: keyof WebEventInput, value: string) => setForm((current) => ({ ...current, [name]: value }));

  return (
    <>
      <Card>
        <TextField label="Form Name" value={form.FormName} onChangeText={(value) => set('FormName', value)} error={errors.field('FormName')} />
        <TextField label="Action Name" value={form.ActionName} onChangeText={(value) => set('ActionName', value)} error={errors.field('ActionName')} />
        <TextField label="Description" value={form.Description} onChangeText={(value) => set('Description', value)} multiline error={errors.field('Description')} />
      </Card>
      <FormError error={errors.general ? save.error : null} />
      <Button title={id ? 'Save' : 'Create'} icon="save-outline" loading={save.isPending} disabled={!form.FormName.trim()} onPress={() => save.mutate(form)} />
    </>
  );
}
