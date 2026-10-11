import { Stack } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { MonthlyAccessForm } from '@/features/access/components/report-access-forms';
import { useMonthlyAccess } from '@/features/access/use-matrix';

export default function MonthlyPayrollReportAccessScreen() {
  const { query } = useMonthlyAccess();

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Monthly Payroll Report Access' }} />
      <QueryBoundary query={query}>{(data) => <MonthlyAccessForm key={query.dataUpdatedAt} initial={data} />}</QueryBoundary>
    </Screen>
  );
}
