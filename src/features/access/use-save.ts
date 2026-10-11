import { useInfiniteQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import type { Paginated } from '@/api/client';
import { toast } from '@/components/ui/toast';

export const accessKey = (...parts: unknown[]): QueryKey => ['admin', 'access', ...parts];

interface Answer {
  message: string | null;
}

/** A mutation that toasts the server message on success and refreshes the related queries. */
export function useSave<V, R extends Answer>(fn: (values: V) => Promise<R>, invalidate: QueryKey[], options?: { fallback?: string; onDone?: (result: R, values: V) => void }) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, values) => {
      toast.success(result.message ?? options?.fallback ?? 'Saved.');
      await Promise.all(invalidate.map((queryKey) => client.invalidateQueries({ queryKey })));
      options?.onDone?.(result, values);
    },
  });
}

/** A page-by-page list: `items` of all loaded pages, `first` (page 1 payload, for filter options), load-more helpers. */
export function usePagedQuery<P, T>(queryKey: QueryKey, fetcher: (page: number) => Promise<P>, pick: (payload: P) => Paginated<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetcher(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { meta } = pick(last);

      return meta.last_page && meta.current_page < meta.last_page ? meta.current_page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];

  return {
    query,
    first: pages[0],
    items: pages.flatMap((page) => pick(page).items),
    total: pages[0] ? pick(pages[0]).meta.total : null,
  };
}
