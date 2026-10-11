import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, type ListRenderItem } from 'react-native';

import { EmptyState, ErrorState, LoadingView } from '@/components/ui/state-views';
import { palette, spacing } from '@/theme/tokens';

interface Props<T> {
  query: UseInfiniteQueryResult<unknown>;
  items: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  header?: React.ReactElement;
  emptyTitle?: string;
  emptyMessage?: string;
}

/** A card list loaded page by page. The header (filters) stays mounted while pages load or fail. */
export function PagedList<T>({ query, items, renderItem, keyExtractor, header, emptyTitle, emptyMessage }: Props<T>) {
  let empty: React.ReactElement;

  if (query.isPending) {
    empty = <LoadingView />;
  } else if (query.isError && items.length === 0) {
    empty = <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  } else {
    empty = <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={palette.primary} /> : null}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.4}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => query.refetch()} tintColor={palette.primary} colors={[palette.primary]} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
