import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/state-views';
import { spacing } from '@/theme/tokens';
import { buildTable } from '@/features/salary-sheet/build-table-shapes';
import { ReportResult } from '@/features/salary-sheet/components/report-result';
import { ReportTable } from '@/features/salary-sheet/components/report-table';
import { useSalaryReport } from '@/features/salary-sheet/use-salary-report';

/** One salary sheet report; the filters of the entry screen arrive as route params. */
export default function SalaryReportScreen() {
  const raw = useLocalSearchParams<Record<string, string | string[]>>();
  const { report, ...rest } = raw;
  const slug = Array.isArray(report) ? report[0] : report;
  const [view, setView] = useState<'table' | 'card'>('table');

  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(rest)) {
    params[key] = Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
  }

  const { definition, query, model } = useSalaryReport(slug, params);
  const table = useMemo(() => (query.data && slug ? buildTable(slug, query.data) : null), [query.data, slug]);

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: definition?.title ?? 'Salary Sheet' }} />
      {!definition ? (
        <EmptyState title="Unknown report" message="This salary report does not exist." />
      ) : (
        <QueryBoundary query={query}>
          {() =>
            model ? (
              <>
                {table ? (
                  <View style={styles.toggle}>
                    <Button title="Table" size="sm" variant={view === 'table' ? 'primary' : 'secondary'} onPress={() => setView('table')} style={styles.flex} />
                    <Button title="Card" size="sm" variant={view === 'card' ? 'primary' : 'secondary'} onPress={() => setView('card')} style={styles.flex} />
                  </View>
                ) : null}
                {table && view === 'table' ? <ReportTable banner={model.banner} table={table} /> : <ReportResult model={model} />}
              </>
            ) : null
          }
        </QueryBoundary>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
