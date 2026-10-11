import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MonthPicker } from '@/components/ui/month-picker';
import { SectionHeader, SwitchRow } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { EmployeePickerModal } from '@/features/salary-sheet/components/employee-picker-modal';
import type { ReportDefinition } from '@/features/salary-sheet/reports';
import { useSalaryEntry } from '@/features/salary-sheet/use-salary-entry';
import { spacing } from '@/theme/tokens';

export default function SalaryReportsScreen() {
  const router = useRouter();
  const entry = useSalaryEntry();
  const [picking, setPicking] = useState(false);
  const { data, filters, set, missing } = entry;

  const run = (report: ReportDefinition) => {
    const params = entry.paramsFor(report);

    if (params) {
      router.push({ pathname: `/salary-reports/${report.slug}`, params });
    }
  };

  return (
    <Screen refreshing={entry.query.isRefetching} onRefresh={() => entry.query.refetch()}>
      <Stack.Screen options={{ title: 'Salary Sheet Report' }} />
      <QueryBoundary query={entry.query}>
        {() => (
          <>
            <Card outlined>
              <SectionHeader title="Employee" />
              <TextField
                label="Select Employee"
                value={filters.employeeCode}
                onChangeText={(value) => set('employeeCode', value)}
                onBlur={entry.lookupEmployee}
                autoCapitalize="none"
                autoCorrect={false}
                error={missing.employeeCode}
                hint="Needed only for Detailed Sheet-one Employee."
              />
              {entry.employee ? (
                <AppText tone="primary" style={styles.found}>
                  {entry.employee.ename}
                  {entry.employee.desig ? ` (${entry.employee.desig})` : ''}
                </AppText>
              ) : null}
              {entry.lookupMessage ? (
                <AppText tone="danger" style={styles.found}>
                  {entry.lookupMessage}
                </AppText>
              ) : null}
              <Button title="Add Employee" variant="info" size="sm" icon="person-add-outline" block={false} onPress={() => setPicking(true)} />
            </Card>

            <Card outlined>
              <SectionHeader title="Filters" />
              <SelectField label="Income Year" value={filters.incomeYear} options={(data?.incomeYears ?? []).map((year) => ({ label: year, value: year }))} onChange={(value) => set('incomeYear', value)} />
              <MonthPicker label="Period (from)" value={filters.dateFrom} onChange={(value) => set('dateFrom', value)} error={missing.dateFrom} />
              <MonthPicker label="Period (to)" value={filters.dateTo} onChange={(value) => set('dateTo', value)} error={missing.dateTo} />
              <SelectField label="Employee Category" value={filters.empCat} options={(data?.employeeCategories ?? []).map((category) => ({ label: category, value: category }))} onChange={(value) => set('empCat', value)} />
              <SelectField
                label="Cost Center"
                value={filters.costCenter}
                options={[{ label: 'Select All', value: '' }, ...(data?.costCenters ?? []).map((center) => ({ label: center.name, value: center.code }))]}
                onChange={(value) => set('costCenter', value)}
              />
              <SelectField
                label="Location"
                value={filters.location}
                options={(data?.locations ?? []).map((location) => ({ label: location.branch_name, value: location.branch_code }))}
                onChange={(value) => set('location', value)}
                error={missing.location}
              />
              <SelectField
                label="Division"
                value={filters.division}
                options={(data?.divisions ?? []).map((division) => ({ label: division.div_name, value: division.div_code }))}
                onChange={(value) => set('division', value)}
                error={missing.division}
              />
              <SelectField
                label="Currency"
                value={filters.currency}
                options={(data?.currencies.length ? data.currencies : ['BDT']).map((currency) => ({ label: currency, value: currency }))}
                onChange={(value) => set('currency', value)}
              />
              <SwitchRow label="Sorted Salary Sheet" value={filters.sortOrder} onChange={(value) => set('sortOrder', value)} />
              <SwitchRow label="Group Item Salary Sheet" value={filters.groupItem} onChange={(value) => set('groupItem', value)} />
            </Card>

            <View style={styles.buttons}>
              {entry.visibleReports.length === 0 ? (
                <AppText tone="muted" style={styles.found}>
                  No salary reports are available for your role.
                </AppText>
              ) : null}
              {entry.visibleReports.map((report) => (
                <Button key={report.slug} title={report.title} onPress={() => run(report)} />
              ))}
            </View>

            <EmployeePickerModal visible={picking} onClose={() => setPicking(false)} onPick={entry.chooseEmployee} />
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  found: { marginBottom: spacing.sm },
  buttons: { gap: spacing.md },
});
