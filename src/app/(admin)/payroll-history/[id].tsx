import { Stack, useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/ui/card';
import { KeyValue } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { usePayrollHistoryItem } from '@/features/payroll/use-payroll-history';

export default function PayrollHistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = usePayrollHistoryItem(id);

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Payroll Details' }} />
      <QueryBoundary query={query}>
        {(item) => (
          <>
            <Card title={`Payroll: ${item.Month} ${item.CalYear}`} outlined>
              <KeyValue label="SL No" value={String(item.Id)} />
              <KeyValue label="CompRef" value={item.CompRef} />
              <KeyValue label="TimeRef" value={item.TimeRef} />
              <KeyValue label="PayrollStatus" value={item.PayrollStatus} />
              <KeyValue label="Status" value={item.Status} />
            </Card>
            <Card title="Creator" outlined>
              <KeyValue label="Creator" value={item.Creator} />
              <KeyValue label="Creation Date" value={item.CreationDate} />
              <KeyValue label="Remarks" value={item.Remarks || '-'} />
            </Card>
            <Card title="Reviewer" outlined>
              <KeyValue label="Reviewer" value={item.ReviewerName || '-'} />
              <KeyValue label="Review Date" value={item.ReviewDate} />
              <KeyValue label="Remarks" value={item.RemarksByReviewer || '-'} />
            </Card>
            <Card title="Approver" outlined>
              <KeyValue label="Approver" value={item.ApproverName || '-'} />
              <KeyValue label="Approved Date" value={item.ApprovedDate} />
              <KeyValue label="Remarks" value={item.RemarksByApprover || '-'} />
            </Card>
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}
