import { Stack, useLocalSearchParams } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { EditUserForm } from '@/features/access/components/user-forms';
import { useUser } from '@/features/access/use-users';

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser(id);

  return (
    <Screen refreshing={user.isRefetching} onRefresh={() => user.refetch()}>
      <Stack.Screen options={{ title: 'Edit User' }} />
      <QueryBoundary query={user}>{(data) => <EditUserForm key={user.dataUpdatedAt} user={data.user} roles={data.roles} />}</QueryBoundary>
    </Screen>
  );
}
