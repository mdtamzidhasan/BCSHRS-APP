import { Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { MatrixForm } from '@/features/access/components/matrix-form';
import { REPORT_COLUMNS, useRoleWebReports } from '@/features/access/use-matrix';

export default function RoleWebReportsScreen() {
  const { roleId, setRoleId, query, save, remove } = useRoleWebReports();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Screen refreshing={query.isRefetching && !save.isPending} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Role Web Report' }} />
      <QueryBoundary query={query}>
        {(data) => (
          <>
            <SelectField label="Role Name" value={roleId} placeholder="Other" options={data.roles.map((role) => ({ label: role.RoleName, value: role.RoleId }))} onChange={setRoleId} />
            <FormError error={save.error ?? remove.error} />
            <MatrixForm
              key={`${roleId}-${query.dataUpdatedAt}`}
              items={data.model.items}
              columns={REPORT_COLUMNS}
              initial={data.model.initial}
              saving={save.isPending}
              disabled={!roleId}
              saveLabel="Save"
              onSave={(values) => save.mutate(values)}
              extra={<Button title="Delete" variant="danger" icon="trash-outline" disabled={!roleId} onPress={() => setConfirmDelete(true)} />}
            />
          </>
        )}
      </QueryBoundary>
      <ConfirmDialog
        visible={confirmDelete}
        title="Delete role reports"
        message="Remove every report permission of this role?"
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(undefined, { onSettled: () => setConfirmDelete(false) })}
      />
    </Screen>
  );
}
