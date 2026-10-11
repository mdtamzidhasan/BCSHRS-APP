import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { LookupMasterView } from '@/features/employee/components/lookup-master-view';
import { useLookupMaster } from '@/features/employee/use-lookup-master';

export default function LookupMasterScreen() {
  const lookup = useLookupMaster();

  return (
    <Screen refreshing={lookup.query.isRefetching} onRefresh={() => lookup.query.refetch()}>
      <Stack.Screen options={{ title: 'Salary Circle, Tax Zone, Bank' }} />
      <QueryBoundary query={lookup.query}>{(data) => <LookupMasterView lookup={lookup} data={data} />}</QueryBoundary>
    </Screen>
  );
}
