import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { InstantMessageView } from '@/features/employee/components/instant-message-view';
import { useInstantMessage } from '@/features/employee/use-instant-message';

export default function InstantMessageScreen() {
  const im = useInstantMessage();

  return (
    <Screen refreshing={im.filters.isRefetching} onRefresh={() => im.filters.refetch()}>
      <Stack.Screen options={{ title: 'Instant Message' }} />
      <QueryBoundary query={im.filters}>{(filters) => <InstantMessageView im={im} filters={filters} />}</QueryBoundary>
    </Screen>
  );
}
