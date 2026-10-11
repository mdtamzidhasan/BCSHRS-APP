import { Stack } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MonthPicker } from '@/components/ui/month-picker';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingView } from '@/components/ui/state-views';
import { ReportResult } from '@/features/salary-sheet/components/report-result';
import { useCostAnalysis } from '@/features/salary-sheet/use-cost-analysis';

export default function CostAnalysisReportScreen() {
  const analysis = useCostAnalysis();
  const { reportQuery } = analysis;

  return (
    <Screen
      refreshing={reportQuery.isRefetching || analysis.defaultsQuery.isRefetching}
      onRefresh={() => (reportQuery.data ? reportQuery.refetch() : analysis.defaultsQuery.refetch())}>
      <Stack.Screen options={{ title: 'Cost Analysis Report' }} />
      <QueryBoundary query={analysis.defaultsQuery}>
        {() => (
          <>
            <Card outlined title="Variance Report">
              <MonthPicker label="Period (from)" value={analysis.from} onChange={analysis.setFrom} />
              <MonthPicker label="Period (to)" value={analysis.to} onChange={analysis.setTo} />
              <Button title="Variance Report" icon="stats-chart-outline" disabled={!analysis.canRun} loading={reportQuery.isFetching} onPress={analysis.run} />
            </Card>

            {reportQuery.isFetching && !reportQuery.data ? <LoadingView /> : null}
            {reportQuery.isError ? <ErrorState error={reportQuery.error} onRetry={() => reportQuery.refetch()} /> : null}
            {analysis.model && !reportQuery.isError ? <ReportResult model={analysis.model} /> : null}
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}
