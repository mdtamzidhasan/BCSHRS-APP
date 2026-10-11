import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchSalaryReport, type ReportParams } from './api';
import { buildReportModel } from './build-model';
import { reportBySlug } from './reports';

/** Runs one salary sheet report (GET /admin/salary-reports/{report}) and shapes it into cards. */
export function useSalaryReport(slug: string | undefined, params: ReportParams) {
  const definition = reportBySlug(slug);
  const key = JSON.stringify(params);

  const query = useQuery({
    queryKey: ['admin', 'salary-sheet', 'report', slug, key],
    enabled: !!definition,
    staleTime: 0,
    retry: false,
    queryFn: () => fetchSalaryReport(definition!.slug, params),
  });

  const model = useMemo(() => (definition && query.data ? buildReportModel(definition.slug, query.data) : null), [definition, query.data]);

  return { definition, query, model };
}
