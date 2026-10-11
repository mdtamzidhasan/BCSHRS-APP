import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/theme/tokens';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/state-views';
import { RecordCard } from '@/components/ui/record-card';

import type { AuditReport } from '../api';

function show(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** The Change Report result: new employees (field list) or changed values (old -> new), one card per employee. */
export function AuditReportView({ report }: { report: AuditReport }) {
  if (report.status === 'NotApprove') {
    return (
      <Card>
        <AppText tone="muted">{report.message}</AppText>
      </Card>
    );
  }

  if (!report.rows || report.rows.length === 0) {
    return <EmptyState title="No record" message="No changes were found for this period." />;
  }

  return (
    <View style={styles.list}>
      {report.rows.map((row) => (
        <RecordCard
          key={row.emp_code}
          title={`${row.emp_code} - ${row.emp_name ?? ''}`}
          fields={
            report.type === 'M'
              ? Object.entries(row.changes ?? {})
                  .filter(([, change]) => change !== null)
                  .map(([column, change]) => ({
                    label: column.replace('Employee', ''),
                    value: `${show(change?.original)}  ->  ${show(change?.new)}`,
                  }))
              : Object.entries(row.fields ?? {}).map(([field, value]) => ({ label: field, value: show(value) }))
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
});
