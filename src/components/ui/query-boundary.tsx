import type { UseQueryResult } from '@tanstack/react-query';

import { ErrorState, LoadingView } from './state-views';

interface Props<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
}

/** Renders the loading and error states of a query, and `children(data)` once data is there (cached data shows at once). */
export function QueryBoundary<T>({ query, children }: Props<T>) {
  if (query.isPending) {
    return <LoadingView />;
  }

  if (query.isError && query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  return <>{children(query.data as T)}</>;
}
