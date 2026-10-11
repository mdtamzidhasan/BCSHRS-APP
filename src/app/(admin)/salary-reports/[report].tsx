import { Stack, useLocalSearchParams } from 'expo-router';

import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/state-views';
import { ReportResult } from '@/features/salary-sheet/components/report-result';
import { useSalaryReport } from '@/features/salary-sheet/use-salary-report';

/** One salary sheet report; the filters of the entry screen arrive as route params. */
export default function SalaryReportScreen() {
  const raw = useLocalSearchParams<Record<string, string | string[]>>();
  const { report, ...rest } = raw;
  const slug = Array.isArray(report) ? report[0] : report;

  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(rest)) {
    params[key] = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
  }

  const { definition, query, model } = useSalaryReport(slug, params);

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: definition?.title ?? 'Salary Sheet' }} />
      {!definition ? (
        <EmptyState title="Unknown report" message="This salary report does not exist." />
      ) : (
        <QueryBoundary query={query}>{() => (model ? <ReportResult model={model} /> : null)}</QueryBoundary>
      )}
    </Screen>
  );
}
