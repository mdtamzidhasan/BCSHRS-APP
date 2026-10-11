import { Stack } from 'expo-router';

import { SelectField } from '@/components/ui/select-field';
import { ListedUserCard } from '@/features/access/components/user-cards';
import { PagedList } from '@/features/access/components/paged-list';
import { useUsersByRole } from '@/features/access/use-users';

export default function UsersByRoleScreen() {
  const list = useUsersByRole();

  return (
    <>
      <Stack.Screen options={{ title: 'Users by Role' }} />
      <PagedList
        query={list.query}
        items={list.items}
        keyExtractor={(user) => user.UserId}
        emptyTitle="No users"
        header={<SelectField label="Role filter" value={list.role} options={[{ label: 'All roles', value: '' }, ...list.roles.map((name) => ({ label: name, value: name }))]} onChange={list.setRole} />}
        renderItem={({ item }) => <ListedUserCard user={item} />}
      />
    </>
  );
}
