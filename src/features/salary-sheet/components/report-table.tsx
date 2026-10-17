import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/state-views';
import { palette, spacing } from '@/theme/tokens';

import type { TableModel } from '../build-table';

const BORDER = '#000';

/** Web-style bordered salary sheet table, scrolling sideways; built from the same JSON as the cards. */
export function ReportTable({ banner, table, emptyMessage = 'No record found for the selected period.' }: { banner: string[]; table: TableModel; emptyMessage?: string }) {
  const rows = table.total ? [...table.rows, table.total] : table.rows;

  return (
    <View style={styles.wrap}>
      {banner.length > 0 ? (
        <View style={styles.banner}>
          {banner.map((line, index) => (
            <AppText key={line} weight={index === 0 ? 'bold' : 'regular'} style={styles.center}>
              {line}
            </AppText>
          ))}
        </View>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState title="No records" message={emptyMessage} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          <View style={styles.table}>
            <View style={styles.row}>
              {table.columns.map((column) => (
                <Text key={column.key} style={[styles.cell, styles.head, { width: column.width }]}>
                  {column.label}
                </Text>
              ))}
            </View>
            {table.numberRow ? (
              <View style={styles.row}>
                {table.numberRow.map((number, index) => (
                  <Text key={table.columns[index].key} style={[styles.cell, { width: table.columns[index].width, textAlign: 'center' }]}>
                    {number}
                  </Text>
                ))}
              </View>
            ) : null}
            {rows.map((row) => (
              <View key={row.key} style={styles.row}>
                {row.cells.map((cell, index) => {
                  const column = table.columns[index];

                  return (
                    <Text key={column.key} style={[styles.cell, row.strong && styles.strong, { width: column.width, textAlign: column.align }]}>
                      {cell}
                    </Text>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  banner: { backgroundColor: palette.surface, borderRadius: 12, padding: spacing.md, gap: 2 },
  center: { textAlign: 'center' },
  table: { backgroundColor: '#fff', borderTopWidth: 1, borderLeftWidth: 1, borderColor: BORDER },
  row: { flexDirection: 'row' },
  cell: { fontSize: 10, color: '#000', paddingHorizontal: 4, paddingVertical: 4, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER },
  head: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f2f2f2' },
  strong: { fontWeight: 'bold' },
});
