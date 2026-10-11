import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { employeeApi, type EmployeeRecord } from './api';

export const employeeKeys = {
  all: ['admin', 'employee'] as const,
  list: ['admin', 'employee', 'list'] as const,
  detail: (code: string) => ['admin', 'employee', 'detail', code] as const,
};

/** The paged employee list (20 per page, by name) with a search over what has been loaded. */
export function useEmployeeList() {
  const [search, setSearch] = useState('');

  const query = useInfiniteQuery({
    queryKey: employeeKeys.list,
    queryFn: ({ pageParam }) => employeeApi.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.last_page && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });

  const employees = useMemo<EmployeeRecord[]>(() => {
    const all = query.data?.pages.flatMap((page) => page.items) ?? [];
    const term = search.trim().toLowerCase();

    if (!term) {
      return all;
    }

    return all.filter((employee) => [employee.code, employee.ename, employee.desig, employee.dept, employee.email].some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [query.data, search]);

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
