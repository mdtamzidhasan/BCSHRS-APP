import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DataList } from '@/components/ui/data-list';
import { DataTable, type TableColumn } from '@/components/ui/data-table';
import { RecordCard } from '@/components/ui/record-card';
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle';
import type { PayrollHistory } from '@/features/payroll/api';
import { usePayrollHistory } from '@/features/payroll/use-payroll-history';
import { spacing } from '@/theme/tokens';

export default function PayrollHistoryScreen() {
  const router = useRouter();
  const query = usePayrollHistory();
  const [mode, setMode] = useState<ViewMode>('card');

  const openDetails = (row: PayrollHistory) => router.push(`/payroll-history/${row.Id}`);

  const columns: TableColumn<PayrollHistory>[] = [
    { key: 'id', title: 'SL No', width: 64, render: (row) => String(row.Id) },
    { key: 'payroll', title: 'Payroll', width: 130, render: (row) => `${row.Month} ${row.CalYear}` },
    { key: 'type', title: 'Type', width: 90, render: (row) => row.TimeRef },
    { key: 'compRef', title: 'CompRef', width: 120, render: (row) => row.CompRef },
    { key: 'creator', title: 'Creator', width: 140, render: (row) => row.Creator },
    { key: 'creationDate', title: 'CreationDate', width: 150, render: (row) => row.CreationDate },
    { key: 'payrollStatus', title: 'PayrollStatus', width: 130, render: (row) => row.PayrollStatus },
    { key: 'status', title: 'STATUS', width: 110, render: (row) => row.Status },
    { key: 'action', title: '', width: 90, align: 'center', render: (row) => <Button title="Details" size="sm" variant="info" block={false} onPress={() => openDetails(row)} /> },
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Payroll History' }} />
      <View style={styles.toolbar}>
        <ViewToggle value={mode} onChange={setMode} />
      </View>
      {mode === 'card' ? (
        <DataList
          query={query}
          keyExtractor={(row) => String(row.Id)}
          emptyTitle="No payroll history"
          renderItem={({ item }) => (
            <RecordCard
              title={`Payroll: ${item.Month} ${item.CalYear}`}
              subtitle={`Type: ${item.TimeRef}`}
              fields={[
                { label: 'SL No', value: String(item.Id) },
                { label: 'CompRef', value: item.CompRef },
                { label: 'Creator', value: item.Creator },
                { label: 'CreationDate', value: item.CreationDate },
              ]}
              actions={<Button title="Details" size="sm" variant="info" block={false} onPress={() => openDetails(item)} />}
              footerFacts={[
                { label: 'PayrollStatus', value: item.PayrollStatus },
                { label: 'STATUS', value: item.Status },
              ]}
            />
          )}
        />
      ) : (
        <DataTable query={query} columns={columns} keyExtractor={(row) => String(row.Id)} emptyTitle="No payroll history" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
});
