import { Stack, useLocalSearchParams } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { WebEventForm } from '@/features/access/components/web-event-form';
import { useWebEvent } from '@/features/access/use-catalogue';

/** `/web-events/new` creates; `/web-events/<id>` edits. */
export default function WebEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const editing = id !== 'new';
  const event = useWebEvent(editing ? id : undefined);

  return (
    <Screen>
      <Stack.Screen options={{ title: editing ? 'Edit Web Report' : 'Add Web Report' }} />
      {editing ? <QueryBoundary query={event}>{(data) => <WebEventForm id={id} event={data} />}</QueryBoundary> : <WebEventForm />}
    </Screen>
  );
}
