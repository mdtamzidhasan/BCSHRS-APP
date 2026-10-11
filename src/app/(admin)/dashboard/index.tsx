import { Stack } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingView } from '@/components/ui/state-views';
import { ReportData } from '@/features/admin-home/components/report-data';
import { useDashboard } from '@/features/admin-home/use-admin-home';

/** Dashboard: company, role and the summary the server returns. */
export default function AdminDashboard() {
  const query = useDashboard();
  const data = query.data;

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      {query.isPending ? <LoadingView /> : null}
      {query.isError && !data ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data ? (
        <>
          <AppText variant="subheading">Company</AppText>
          <ReportData data={pick(data.company, ['company_code', 'company_name', 'name', 'type', 'address', 'email', 'phone'])} />
          <AppText variant="subheading">Role</AppText>
          <ReportData data={pick(data.role, ['id', 'name', 'role_name', 'description'])} />
          <AppText variant="subheading">Summary</AppText>
          <ReportData data={data.summary} />
          <AppText variant="subheading">Responsibilities</AppText>
          <ReportData data={data.responsibilities} />
        </>
      ) : null}
    </Screen>
  );
}

/** Keeps only the listed keys (falls back to everything when none match) so internal columns stay off the phone. */
function pick(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const picked = Object.fromEntries(Object.entries(source).filter(([key]) => keys.includes(key)));

  return Object.keys(picked).length > 0 ? picked : source;
}
