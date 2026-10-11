import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { CreateUserForm } from '@/features/access/components/user-forms';
import { useUserFormData } from '@/features/access/use-users';

export default function NewUserScreen() {
  const data = useUserFormData();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Add User' }} />
      <QueryBoundary query={data}>{({ companies, roles }) => <CreateUserForm companies={companies} roles={roles} />}</QueryBoundary>
    </Screen>
  );
}
