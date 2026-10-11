import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { PayrollAccessForm } from '@/features/access/components/report-access-forms';
import { usePayrollAccess } from '@/features/access/use-matrix';

export default function PayrollReportAccessScreen() {
  const { query } = usePayrollAccess();

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Payroll Report Access' }} />
      <QueryBoundary query={query}>{(flags) => <PayrollAccessForm key={query.dataUpdatedAt} initial={flags} />}</QueryBoundary>
    </Screen>
  );
}
