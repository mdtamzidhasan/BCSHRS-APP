import { Stack, useRouter } from 'expo-router';

import { DataList } from '@/components/ui/data-list';
import { ListRow } from '@/components/ui/list-row';

import { useMatrixRoles } from '../use-matrix';

interface Props {
  base: 'permissions' | 'menu-permissions';
  title: string;
}

/** Step one of a permission matrix: pick the role, which opens `/<base>/<RoleId>`. */
export function RolePickerScreen({ base, title }: Props) {
  const router = useRouter();
  const roles = useMatrixRoles(base);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <DataList
        query={roles}
        keyExtractor={(role) => role.RoleId}
        emptyTitle="No roles"
        renderItem={({ item }) => <ListRow icon="shield-checkmark-outline" title={item.RoleName} onPress={() => router.push(`/${base}/${item.RoleId}`)} />}
      />
    </>
  );
}
