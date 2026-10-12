import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { MatrixForm } from '@/features/access/components/matrix-form';
import { MENU_COLUMNS, useRoleWebMenus } from '@/features/access/use-matrix';

/** LEGACY: Member/RoleWebMenuUI.aspx — a role dropdown (Other + every role) and the menu matrix, Save / RESET. */
export default function RoleWebMenusScreen() {
  const { roleId, setRoleId, query, save } = useRoleWebMenus();

  return (
    <Screen refreshing={query.isRefetching && !save.isPending} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Role Web Menu' }} />
      <QueryBoundary query={query}>
        {(data) => (
          <>
            <SelectField label="Role Name" value={roleId} placeholder="Other" options={data.roles.map((role) => ({ label: role.RoleName, value: role.RoleId }))} onChange={setRoleId} />
            <FormError error={save.error} />
            <MatrixForm
              key={`${roleId}-${query.dataUpdatedAt}`}
              items={data.model.items}
              columns={MENU_COLUMNS}
              initial={data.model.initial}
              saving={save.isPending}
              disabled={!roleId}
              saveLabel="Save"
              onSave={(values) => save.mutate(values)}
            />
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}
