import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { ReportActionCard } from '@/components/ui/report-action-card';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { useAuth } from '@/hooks/use-auth';
import { htmlToText } from '@/features/member/components/html-text';
import { useReportPicker } from '@/features/member/use-member';
import { spacing } from '@/theme/tokens';

/** Member Home: welcome, the period filters and the self-service reports this member may open. */
export default function MemberHome() {
  const { user } = useAuth();
  const router = useRouter();
  const picker = useReportPicker();

  return (
    <Screen refreshing={picker.dashboard.isRefetching} onRefresh={() => void picker.dashboard.refetch()}>
      <AppText variant="heading">Welcome, {user?.username}!</AppText>

      <QueryBoundary query={picker.dashboard}>
        {(data) => (
          <>
            {data.notification ? (
              <Card outlined>
                <AppText>{htmlToText(data.notification)}</AppText>
                <Button title="Add mobile number" variant="secondary" onPress={() => router.push('/member/add-mobile' as never)} style={styles.gap} />
              </Card>
            ) : null}

            <Card>
              <SectionHeader title="Report period" />
              <View style={styles.filters}>
                <SelectField label="Income Year" value={picker.incomeYear} options={data.incomeYears.map((year) => ({ label: year, value: year }))} onChange={picker.setIncomeYear} />
                <SelectField label="Month" value={picker.month} options={data.months.map((month) => ({ label: month.text, value: month.value }))} onChange={picker.setMonth} />
                <SelectField label="PF Year" value={picker.pfYear} options={data.pfYears.map((year) => ({ label: year, value: year }))} onChange={picker.setPfYear} />
              </View>
            </Card>

            {picker.entries.map((entry) => (
              <ReportActionCard key={entry.kind} title={entry.title} actionLabel="View" onPress={() => picker.open(entry)} />
            ))}
            {picker.showPdfs ? <ReportActionCard title="Others Reports" actionLabel="Open" onPress={() => router.push('/member/pdfs' as never)} /> : null}
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { marginTop: spacing.sm },
  gap: { marginTop: spacing.md },
});
