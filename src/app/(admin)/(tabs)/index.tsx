import { useRouter } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { ReportActionCard } from '@/components/ui/report-action-card';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { ErrorState, LoadingView } from '@/components/ui/state-views';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { EmployeePdfs } from '@/features/admin-home/components/employee-pdfs';
import { EmployeePicker } from '@/features/admin-home/components/employee-picker';
import { SCOPES } from '@/features/admin-home/reports';
import { useHomeOptions } from '@/features/admin-home/use-admin-home';
import { useHomeFilters } from '@/features/admin-home/use-home-filters';
import type { ReportScope } from '@/features/admin-home/api';

/** Home — pick the scope and period, then open a report. */
export default function AdminHome() {
  const { user } = useAuth();
  const router = useRouter();
  const home = useHomeOptions();
  const filters = useHomeFilters(home.data);
  const options = home.data;

  const open = (key: string, params: Record<string, string> | null) => {
    if (!params) {
      toast.error(filters.scope === 1 ? 'Please select an employee.' : filters.scope >= 3 ? 'Please select a value for the group.' : 'Please select the period.');

      return;
    }

    router.push({ pathname: '/reports/[report]', params: { report: key, ...params } });
  };

  return (
    <Screen refreshing={home.isRefetching} onRefresh={() => home.refetch()}>
      <AppText variant="heading">Welcome, {user?.username}!</AppText>

      {home.isPending ? <LoadingView /> : null}
      {home.isError && !options ? <ErrorState error={home.error} onRetry={() => home.refetch()} /> : null}

      {options ? (
        <>
          <Card>
            <RadioGroup<ReportScope> value={filters.scope} options={[...SCOPES]} onChange={filters.changeScope} />

            {filters.scope === 1 ? <EmployeePicker code={filters.employeeCode} onSelect={filters.setEmployeeCode} /> : null}
            {filters.scope >= 3 ? (
              <SelectField
                label={SCOPES[filters.scope - 1].label}
                value={filters.groupValue}
                options={filters.groupOptions}
                onChange={filters.setGroupValue}
              />
            ) : null}

            <SelectField label="Income Year" value={filters.incomeYear} options={options.incomeYears.map((year) => ({ label: year, value: year }))} onChange={filters.setIncomeYear} />
            <SelectField label="Month" value={filters.month} options={options.months.map((month) => ({ label: month.text, value: String(month.value) }))} onChange={filters.setMonth} />
            <SelectField label="PF Year" value={filters.pfYear} options={options.pfYears.map((year) => ({ label: year, value: year }))} onChange={filters.setPfYear} />
          </Card>

          {filters.visibleReports.map((report) => (
            <ReportActionCard key={report.key} title={report.title} actionLabel={report.actionLabel} onPress={() => open(report.key, filters.paramsFor(report))} />
          ))}

          {filters.scope === 1 ? <EmployeePdfs code={filters.employeeCode} enabled /> : null}
        </>
      ) : null}
    </Screen>
  );
}
