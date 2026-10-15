import { Stack, useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { PdfButton } from '@/components/ui/pdf-button';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingView } from '@/components/ui/state-views';
import { REPORT_ENDPOINTS } from '@/features/admin-home/api';
import { ReportData } from '@/features/admin-home/components/report-data';
import { useReportScreen } from '@/features/admin-home/use-report-screen';

/** Report viewer: renders the report JSON as cards; for group scopes lists the employees (and the full print bundle). */
export default function ReportViewer() {
  const router = useRouter();
  const screen = useReportScreen();
  const { singleQuery, codesQuery, printQuery } = screen;

  const openEmployee = (code: string) => {
    const query: Record<string, string> = { report: screen.report, type: '1', value: '', employee_code: code };

    Object.entries(screen.period).forEach(([key, value]) => {
      if (value) {
        query[key] = value;
      }
    });

    router.push({ pathname: '/reports/[report]', params: query });
  };

  if (screen.single) {
    return (
      <Screen refreshing={singleQuery.isRefetching} onRefresh={() => singleQuery.refetch()}>
        <Stack.Screen options={{ title: screen.title }} />
        <AppText variant="subheading">Employee {screen.params.employee_code}</AppText>
        {singleQuery.isPending ? <LoadingView /> : null}
        {singleQuery.isError && singleQuery.data === undefined ? <ErrorState error={singleQuery.error} onRetry={() => singleQuery.refetch()} /> : null}
        {singleQuery.data !== undefined ? <ReportData data={singleQuery.data} /> : null}
        {singleQuery.data !== undefined ? <PdfButton path={REPORT_ENDPOINTS[screen.report]} params={screen.params} fileName={screen.report} /> : null}
      </Screen>
    );
  }

  const codes = codesQuery.data?.codes ?? [];

  return (
    <Screen refreshing={codesQuery.isRefetching} onRefresh={() => codesQuery.refetch()}>
      <Stack.Screen options={{ title: screen.title }} />
      {codesQuery.isPending ? <LoadingView /> : null}
      {codesQuery.isError && codesQuery.data === undefined ? <ErrorState error={codesQuery.error} onRetry={() => codesQuery.refetch()} /> : null}
      {codesQuery.isSuccess && codes.length === 0 ? <EmptyState title="No employees" message="Sorry, data is not available in the system." /> : null}

      {codes.length > 0 ? (
        <>
          <AppText tone="muted">{codes.length} employee(s)</AppText>
          <Button title={screen.showAll ? 'Hide all reports' : 'Show all reports (print bundle)'} icon="print-outline" variant="info" onPress={() => screen.setShowAll(!screen.showAll)} />
        </>
      ) : null}

      {screen.showAll ? (
        <>
          {printQuery.isFetching ? <LoadingView /> : null}
          {printQuery.isError ? <ErrorState error={printQuery.error} onRetry={() => printQuery.refetch()} /> : null}
          {printQuery.data?.reports.map((entry) => (
            <Card key={entry.employee_code} outlined title={`Employee ${entry.employee_code}`}>
              {entry.success ? <ReportData data={entry.data} /> : <AppText tone="danger">{entry.message ?? 'Report not available.'}</AppText>}
            </Card>
          ))}
        </>
      ) : (
        codes.map((code) => <ListRow key={code} icon="person-outline" title={code} subtitle="Open report" onPress={() => openEmployee(code)} />)
      )}
    </Screen>
  );
}
