import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { RecordCard } from '@/components/ui/record-card';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, FormError } from '@/components/ui/state-views';
import { useFormErrors } from '@/hooks/use-form-errors';
import { assignmentOptions, useUserRoleAssignment } from '@/features/access/use-roles';

export default function UserRoleAssignmentScreen() {
  const screen = useUserRoleAssignment();
  const { form, setForm, save, remove } = screen;
  const [toDelete, setToDelete] = useState<number | null>(null);
  const errors = useFormErrors(save.error);

  return (
    <Screen refreshing={screen.query.isRefetching} onRefresh={() => screen.query.refetch()}>
      <Stack.Screen options={{ title: 'User Role Assignment' }} />
      <QueryBoundary query={screen.query}>
        {(data) => {
          const options = assignmentOptions(data);

          return (
            <>
              <Card title={form.id ? 'Edit assignment' : 'Assign role'}>
                <SelectField label="User Name" value={form.user} options={options.users} onChange={(user) => setForm({ ...form, user })} error={errors.field('user_name')} />
                <SelectField label="Role" value={form.role} options={options.roles} onChange={(role) => setForm({ ...form, role })} error={errors.field('role_id')} />
                <SelectField label="Company" value={form.company} options={options.companies} onChange={(company) => setForm({ ...form, company })} error={errors.field('company_id')} />
                <FormError error={errors.general ? save.error : null} />
                <Button title={form.id ? 'Save' : 'Create'} icon="save-outline" loading={save.isPending} disabled={!form.user || !form.role || !form.company} onPress={() => save.mutate()} />
                {form.id ? <Button title="Cancel edit" variant="ghost" onPress={screen.reset} /> : null}
              </Card>
              <SectionHeader title="Assignments" />
              {data.assignments.length === 0 ? <EmptyState title="No assignments" /> : null}
              {data.assignments.map((row) => (
                <RecordCard
                  key={row.UserRoleId}
                  title={row.UserName}
                  fields={[
                    { label: 'Role', value: row.role?.RoleName ?? '-' },
                    { label: 'Company', value: row.company_profile?.cname ?? '-' },
                  ]}
                  actions={
                    <>
                      <Button title="Edit" variant="info" size="sm" block={false} onPress={() => screen.edit(row)} />
                      <Button title="Delete" variant="danger" size="sm" block={false} onPress={() => setToDelete(row.UserRoleId)} />
                    </>
                  }
                />
              ))}
            </>
          );
        }}
      </QueryBoundary>
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete assignment"
        message="Remove this role and company from the user?"
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete !== null && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </Screen>
  );
}
