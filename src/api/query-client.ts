import { QueryClient } from '@tanstack/react-query';

import { QUERY_STALE_MS } from '@/lib/config';

import { ApiError } from './errors';

/**
 * Server-state cache. A report opened a second time is served from memory at once and revalidated silently in the
 * background once it is older than QUERY_STALE_MS. The cache is memory-only on purpose: payroll figures are never written
 * to unencrypted disk, and it is cleared when the session ends.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_MS,
      gcTime: 30 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Validation, permission and auth failures will not change by asking again.
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }

        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});
