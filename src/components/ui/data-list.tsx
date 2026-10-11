import type { UseQueryResult } from '@tanstack/react-query';
import { FlatList, RefreshControl, StyleSheet, type ListRenderItem } from 'react-native';

import { palette, spacing } from '@/theme/tokens';

import { EmptyState, ErrorState, LoadingView } from './state-views';

interface Props<T> {
  query: UseQueryResult<T[]>;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  header?: React.ReactElement;
}

/** A list bound to a query: spinner on first load, error with Retry, empty state, pull-to-refresh. */
export function DataList<T>({ query, renderItem, keyExtractor, emptyTitle, emptyMessage, header }: Props<T>) {
  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return (
    <FlatList
      data={query.data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState title={emptyTitle} message={emptyMessage} />}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
