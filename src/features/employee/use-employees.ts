import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { employeeApi, type EmployeeRecord } from './api';

export const employeeKeys = {
  all: ['admin', 'employee'] as const,
  list: ['admin', 'employee', 'list'] as const,
  detail: (code: string) => ['admin', 'employee', 'detail', code] as const,
};

/** Waits for the typing to pause before the search goes to the server. */
function useDebounced(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** The paged employee list (20 per page, by name); the search box looks in the employee code and name on the server, over the whole company. */
export function useEmployeeList() {
  const [search, setSearch] = useState('');
  const term = useDebounced(search.trim());

  const query = useInfiniteQuery({
    queryKey: [...employeeKeys.list, term],
    queryFn: ({ pageParam }) => employeeApi.list(pageParam, term),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (last) => (last.meta.last_page && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });

  const employees = useMemo<EmployeeRecord[]>(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);

  return {
    query,
    employees,
    search,
    setSearch,
    total: query.data?.pages[0]?.meta.total ?? null,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
  };
}
