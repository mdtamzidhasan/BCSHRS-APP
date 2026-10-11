import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge, SectionHeader } from '@/components/ui/misc';
import { palette, radius, spacing } from '@/theme/tokens';
import type { PfPreviewRow } from '../api';

/** The rows read from the file: employee, name, value and whether the employee was found (only valid rows are saved). */
export function UploadPreview({ rows }: { rows: PfPreviewRow[] }) {
  const valid = rows.filter((row) => row.valid).length;

  return (
    <View style={styles.wrap}>
      <SectionHeader title={`Preview (${valid} of ${rows.length} valid)`} />
      {rows.length === 0 ? <AppText tone="muted">No rows were read from the file.</AppText> : null}
      {rows.map((row, index) => (
        <View key={`${row.employee_code}-${index}`} style={[styles.row, !row.valid && styles.invalid]}>
          <View style={styles.main}>
            <AppText weight="medium">{row.employee_code}</AppText>
            <AppText tone="muted" variant="caption">
              {[row.name, row.designation].filter(Boolean).join(' - ') || 'Employee not found'}
            </AppText>
          </View>
          <AppText weight="medium">{String(row.value)}</AppText>
          <Badge label={row.valid ? 'YES' : 'NO'} tone={row.valid ? 'success' : 'danger'} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.surface, borderRadius: radius.md, borderWidth: 1, borderColor: palette.border, padding: spacing.md },
  invalid: { borderColor: palette.danger },
  main: { flex: 1 },
});
