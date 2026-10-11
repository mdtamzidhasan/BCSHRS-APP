import { Stack, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { MatrixForm } from '@/features/access/components/matrix-form';
import { MENU_COLUMNS, useMenuMatrix, useSaveMenuMatrix } from '@/features/access/use-matrix';

export default function RoleMenuPermissionsScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const matrix = useMenuMatrix(role);
  const save = useSaveMenuMatrix(role);

  return (
    <Screen refreshing={matrix.isRefetching && !save.isPending} onRefresh={() => matrix.refetch()}>
      <Stack.Screen options={{ title: 'Role Web Menu' }} />
      <QueryBoundary query={matrix}>
        {(data) => (
          <>
            <AppText variant="heading">{data.roleName}</AppText>
            <MatrixForm key={`${role}-${matrix.dataUpdatedAt}`} items={data.items} columns={MENU_COLUMNS} initial={data.initial} saving={save.isPending} onSave={(values) => save.mutate(values)} />
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}
