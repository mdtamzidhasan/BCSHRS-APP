import { Stack } from 'expo-router';

import { DataList } from '@/components/ui/data-list';
import { ListedUserCard } from '@/features/access/components/user-cards';
import { useUsersByCompany } from '@/features/access/use-users';

export default function UsersByCompanyScreen() {
  const users = useUsersByCompany();

  return (
    <>
      <Stack.Screen options={{ title: 'Users by Company' }} />
      <DataList query={users} keyExtractor={(user) => user.UserId} emptyTitle="No users" renderItem={({ item }) => <ListedUserCard user={item} />} />
    </>
  );
}
