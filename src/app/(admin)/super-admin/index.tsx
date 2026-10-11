import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge, SectionHeader, SwitchRow } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { RecordCard } from '@/components/ui/record-card';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, FormError } from '@/components/ui/state-views';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useSuperAdmin } from '@/features/access/use-roles';

const DOMAINS = [
  { label: 'BCSHRS1', value: 'BCSHRS1' },
  { label: 'BCSHRS2', value: 'BCSHRS2' },
];

export default function SuperAdminScreen() {
  const screen = useSuperAdmin();
  const { form, setForm, save, remove } = screen;
  const [toDelete, setToDelete] = useState<number | null>(null);
  const errors = useFormErrors(save.error);

  return (
    <Screen refreshing={screen.query.isRefetching} onRefresh={() => screen.query.refetch()}>
      <Stack.Screen options={{ title: 'Create Super Admin' }} />
      <QueryBoundary query={screen.query}>
        {(data) => (
          <>
            <Card title={form.id ? 'Edit super admin' : 'Flag a super admin'}>
              <SelectField label="User Name" value={form.user} options={data.users.map((user) => ({ label: user.UserName, value: user.UserName }))} onChange={(user) => setForm({ ...form, user })} error={errors.field('user_name')} />
              <SelectField label="Domain Name" value={form.domain} options={DOMAINS} onChange={(domain) => setForm({ ...form, domain })} error={errors.field('domain')} />
              <SwitchRow label="Is Active" value={form.active} onChange={(active) => setForm({ ...form, active })} />
              <FormError error={errors.general ? save.error : null} />
              <Button title={form.id ? 'Save' : 'Create'} icon="save-outline" loading={save.isPending} disabled={!form.user} onPress={() => save.mutate()} />
              {form.id ? <Button title="Cancel edit" variant="ghost" onPress={screen.reset} /> : null}
            </Card>
            <SectionHeader title="Super admins" />
            {data.superAdmins.length === 0 ? <EmptyState title="No super admins" /> : null}
            {data.superAdmins.map((row) => (
              <RecordCard
                key={row.Id}
                title={row.UserName}
                fields={[
                  { label: 'Domain', value: row.DomainName },
                  { label: 'Is Active', value: <Badge label={row.IsActive ? 'Active' : 'Inactive'} tone={row.IsActive ? 'success' : 'neutral'} /> },
                ]}
                actions={
                  <>
                    <Button title="Edit" variant="info" size="sm" block={false} onPress={() => screen.edit(row)} />
                    <Button title="Delete" variant="danger" size="sm" block={false} onPress={() => setToDelete(row.Id)} />
                  </>
                }
              />
            ))}
          </>
        )}
      </QueryBoundary>
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete super admin"
        message="Remove this super admin flag?"
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete !== null && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </Screen>
  );
}
