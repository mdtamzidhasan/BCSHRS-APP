import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import type { ReportKey, ReportParams } from './api';
import { reportTitle } from './reports';
import { toBulkParams } from './use-home-filters';
import { useBulkCodes, useBulkPrint, useReport } from './use-admin-home';

/** State of the report viewer: one employee's report, or the bulk list (All / Department / Costcenter / Category). */
export function useReportScreen() {
  const raw = useLocalSearchParams<Record<string, string>>();
  const report = (raw.report ?? 'payslip') as ReportKey;
  const bulk = toBulkParams(raw);
  const single = Boolean(raw.employee_code) && (Number(raw.type) || 1) === 1;
  const [showAll, setShowAll] = useState(false);

  const params: ReportParams = { employee_code: raw.employee_code, income_year: raw.income_year, month: raw.month, pf_year: raw.pf_year };

  return {
    report,
    title: reportTitle(report),
    single,
    params,
    showAll,
    setShowAll,
    singleQuery: useReport(report, params, single),
    codesQuery: useBulkCodes(report, bulk, !single),
    printQuery: useBulkPrint(report, bulk, !single && showAll),
    period: { income_year: raw.income_year, month: raw.month, pf_year: raw.pf_year },
  };
}
