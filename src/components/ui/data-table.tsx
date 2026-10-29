import type { UseQueryResult } from '@tanstack/react-query';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import { EmptyState, ErrorState, LoadingView } from './state-views';

export interface TableColumn<T> {
  key: string;
  title: string;
  /** Fixed column width in dp: the table is wider than a phone, so it scrolls sideways. */
  width: number;
  align?: 'left' | 'center' | 'right';
  /** Plain text/number, or any node (e.g. a button). */
  render: (row: T) => React.ReactNode;
}

interface Props<T> {
  query: UseQueryResult<T[]>;
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  /** Makes each row tappable. Leave out when a column already holds the action button. */
  onRowPress?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

/**
 * The table form of a list: a header row + one row per record, scrolling sideways when the columns do not fit, with the
 * header pinned while scrolling down. Same states as `DataList` (spinner, error with Retry, empty, pull-to-refresh).
 */
export function DataTable<T>({ query, columns, keyExtractor, onRowPress, emptyTitle, emptyMessage }: Props<T>) {
  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  return (
    <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator>
      <FlatList
        style={{ width: tableWidth }}
        data={query.data}
        keyExtractor={keyExtractor}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <Cell key={column.key} column={column}>
                <AppText weight="bold" tone="inverse" style={[styles.headerText, { textAlign: column.align ?? 'left' }]}>
                  {column.title}
                </AppText>
              </Cell>
            ))}
          </View>
        }
        ListEmptyComponent={<EmptyState title={emptyTitle} message={emptyMessage} />}
        renderItem={({ item, index }) => {
          const cells = columns.map((column) => {
            const value = column.render(item);

            return (
              <Cell key={column.key} column={column}>
                {typeof value === 'string' || typeof value === 'number' ? (
                  <AppText numberOfLines={2} style={{ textAlign: column.align ?? 'left' }}>
                    {value}
                  </AppText>
                ) : (
                  value
                )}
              </Cell>
            );
          });

          return onRowPress ? (
            <Pressable accessibilityRole="button" onPress={() => onRowPress(item)} style={({ pressed }) => [styles.row, index % 2 === 1 && styles.rowAlt, pressed && styles.rowPressed]}>
              {cells}
            </Pressable>
          ) : (
            <View style={[styles.row, index % 2 === 1 && styles.rowAlt]}>{cells}</View>
          );
        }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
        contentContainerStyle={styles.listContent}
      />
    </ScrollView>
  );
}

interface InlineProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (row: T) => void;
  /** Shown instead of the table body when there are no rows. */
  empty?: React.ReactNode;
  /** The full row count when `rows` is only the first chunk of a longer list: adds a "Showing x of y" line. */
  total?: number;
}

/**
 * A plain (non-virtualised) table to drop inside a screen that already scrolls vertically, e.g. under a form. It only
 * scrolls sideways; fine for the short lists of the admin setup screens.
 */
export function InlineTable<T>({ rows, columns, keyExtractor, onRowPress, empty, total }: InlineProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  return (
    <>
    <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
      <View style={{ width: tableWidth }}>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Cell key={column.key} column={column}>
              <AppText weight="bold" tone="inverse" style={[styles.headerText, { textAlign: column.align ?? 'left' }]}>
                {column.title}
              </AppText>
            </Cell>
          ))}
        </View>
        {rows.map((row, index) => {
          const cells = columns.map((column) => {
            const value = column.render(row);

            return (
              <Cell key={column.key} column={column}>
                {typeof value === 'string' || typeof value === 'number' ? (
                  <AppText numberOfLines={2} style={{ textAlign: column.align ?? 'left' }}>
                    {value}
                  </AppText>
                ) : (
                  value
                )}
              </Cell>
            );
          });

          return onRowPress ? (
            <Pressable key={keyExtractor(row, index)} accessibilityRole="button" onPress={() => onRowPress(row)} style={({ pressed }) => [styles.row, index % 2 === 1 && styles.rowAlt, pressed && styles.rowPressed]}>
              {cells}
            </Pressable>
          ) : (
            <View key={keyExtractor(row, index)} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
              {cells}
            </View>
          );
        })}
      </View>
    </ScrollView>
    {total !== undefined && rows.length < total ? (
      <AppText variant="caption" tone="muted" style={styles.more}>
        Showing {rows.length} of {total}. Scroll down to load more.
      </AppText>
    ) : null}
    </>
  );
}

function Cell<T>({ column, children }: { column: TableColumn<T>; children: React.ReactNode }) {
  const justify = column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start';

  return <View style={[styles.cell, { width: column.width, justifyContent: justify }]}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { minWidth: '100%', paddingHorizontal: spacing.lg },
  listContent: { paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', backgroundColor: palette.tableHeader },
  headerText: { fontSize: 13 },
  row: { flexDirection: 'row', backgroundColor: palette.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
  rowAlt: { backgroundColor: palette.background },
  rowPressed: { backgroundColor: palette.primarySoft },
  cell: { paddingHorizontal: spacing.sm, paddingVertical: spacing.md, justifyContent: 'center' },
  more: { textAlign: 'center', paddingVertical: spacing.md },
});
