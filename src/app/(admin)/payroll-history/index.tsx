import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DataList } from '@/components/ui/data-list';
import { RecordCard } from '@/components/ui/record-card';
import { usePayrollHistory } from '@/features/payroll/use-payroll-history';

export default function PayrollHistoryScreen() {
  const router = useRouter();
  const query = usePayrollHistory();

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Payroll History' }} />
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
            actions={<Button title="Details" size="sm" variant="info" block={false} onPress={() => router.push(`/payroll-history/${item.Id}`)} />}
            footerFacts={[
              { label: 'PayrollStatus', value: item.PayrollStatus },
              { label: 'STATUS', value: item.Status },
            ]}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
