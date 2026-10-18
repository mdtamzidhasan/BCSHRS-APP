import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RecordCard } from '@/components/ui/record-card';
import { PagedList } from '@/features/access/components/paged-list';
import { UserFilterBar } from '@/features/access/components/user-filter-bar';
import { UserStatusBadges } from '@/features/access/components/user-cards';
import { useDeleteUser, useUserList } from '@/features/access/use-users';

export default function UsersScreen() {
  const router = useRouter();
  const list = useUserList();
  const remove = useDeleteUser();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <>
      <Stack.Screen options={{ title: 'Users' }} />
      <PagedList
        query={list.query}
        items={list.items}
        keyExtractor={(user) => user.UserId}
        emptyTitle="No users found"
        header={
          <>
            <Button title="Add User" icon="person-add-outline" onPress={() => router.push('/users/new')} />
            <UserFilterBar draft={list.draft} roles={list.roles} onField={list.setField} onSelect={list.setSelect} onSearch={list.apply} onReset={list.reset} />
          </>
        }
        renderItem={({ item }) => (
          <RecordCard
            title={item.UserName}
            fields={[
              { label: 'Email', value: item.membership?.Email || '-' },
              { label: 'ID', value: item.detail?.EmployeeId || '-' },
              { label: 'Created', value: item.legacy?.CreationDate || '-' },
              { label: 'Last login', value: item.legacy?.LastLoginDate || '-' },
              { label: 'Last activity', value: item.legacy?.LastActivityDate || '-' },
              { label: 'Status', value: <UserStatusBadges approved={item.membership?.IsApproved} online={item.IsOnline} locked={item.membership?.IsLockedOut} /> },
            ]}
            actions={
              <>
                <Button title="Edit" variant="info" size="sm" block={false} onPress={() => router.push(`/users/${item.UserId}`)} />
                <Button title="Delete" variant="danger" size="sm" block={false} onPress={() => setToDelete(item.UserId)} />
              </>
            }
          />
        )}
      />
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete user"
        message="Delete this user? This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </>
  );
}
