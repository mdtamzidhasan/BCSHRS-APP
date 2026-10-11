import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RecordCard } from '@/components/ui/record-card';
import { PagedList } from '@/features/access/components/paged-list';
import { useDeleteWebEvent, useWebEvents } from '@/features/access/use-catalogue';

export default function WebEventsScreen() {
  const router = useRouter();
  const events = useWebEvents();
  const remove = useDeleteWebEvent();
  const [toDelete, setToDelete] = useState<number | null>(null);

  return (
    <>
      <Stack.Screen options={{ title: 'Web Report' }} />
      <PagedList
        query={events.query}
        items={events.items}
        keyExtractor={(event) => String(event.WebEventId)}
        emptyTitle="No web reports"
        header={<Button title="Add Web Report" icon="add-circle-outline" onPress={() => router.push('/web-events/new')} />}
        renderItem={({ item }) => (
          <RecordCard
            title={item.FormName}
            fields={[
              { label: 'Action', value: item.ActionName || '-' },
              { label: 'Description', value: item.Description || '-' },
            ]}
            actions={
              <>
                <Button title="Edit" variant="info" size="sm" block={false} onPress={() => router.push(`/web-events/${item.WebEventId}`)} />
                <Button title="Delete" variant="danger" size="sm" block={false} onPress={() => setToDelete(item.WebEventId)} />
              </>
            }
          />
        )}
      />
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete web report"
        message="Delete this web report? A report still granted to a role cannot be deleted."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete !== null && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </>
  );
}
