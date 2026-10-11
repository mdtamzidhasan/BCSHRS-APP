import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { RecordCard } from '@/components/ui/record-card';
import { Screen } from '@/components/ui/screen';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import { useAddRole, useDeleteRole, useRoles } from '@/features/access/use-roles';

export default function RolesScreen() {
  const roles = useRoles();
  const [name, setName] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);
  const add = useAddRole(() => setName(''));
  const remove = useDeleteRole();
  const errors = useFormErrors(add.error);

  return (
    <Screen refreshing={roles.isRefetching} onRefresh={() => roles.refetch()}>
      <Stack.Screen options={{ title: 'Roles' }} />
      <Card title="Add role">
        <TextField label="Role Name" value={name} onChangeText={setName} autoCapitalize="none" error={errors.field('role_name')} />
        <FormError error={errors.general ? add.error : null} />
        <Button title="Add Role" icon="add-circle-outline" loading={add.isPending} disabled={!name.trim()} onPress={() => add.mutate(name)} />
      </Card>
      <SectionHeader title="All roles" />
      <QueryBoundary query={roles}>
        {(data) =>
          data.map((role) => (
            <RecordCard
              key={role.RoleId}
              title={role.RoleName}
              fields={[{ label: 'Users', value: String(role.user_roles_count ?? 0) }]}
              actions={<Button title="Delete" variant="danger" size="sm" block={false} icon="trash-outline" onPress={() => setToDelete(role.RoleName)} />}
            />
          ))
        }
      </QueryBoundary>
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete role"
        message={`Delete role '${toDelete}'? A role that still has users cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </Screen>
  );
}
