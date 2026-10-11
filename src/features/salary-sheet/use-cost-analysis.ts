import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { fetchCostAnalysis, fetchCostAnalysisDefaults, type CostAnalysisResponse } from './api';
import type { ReportModel, ReportCardData, CardLine } from './build-model';
import { formatN, monthLabel } from './format';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Mar-2026" (server pre-fill) -> "2026-03". */
function toYearMonth(text: string): string {
  const match = /^([A-Za-z]{3})[A-Za-z]*[-,\s/]+(\d{4})$/.exec(text.trim());
  const index = match ? SHORT_MONTHS.findIndex((month) => month.toLowerCase() === match[1].toLowerCase()) : -1;

  return match && index >= 0 ? `${match[2]}-${String(index + 1).padStart(2, '0')}` : '';
}

/** "2026-03" -> "Mar-2026" (a form the server's DateFrom / DateTo parser reads). */
function toServerMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');

  return `${SHORT_MONTHS[Number(month) - 1] ?? ''}-${year}`;
}

function toModel(report: CostAnalysisResponse): ReportModel {
  const cards = report.rows.map((row): ReportCardData => {
    const lines = (components: { name: string }[], amounts: number[]): CardLine[] =>
      components.map((component, index) => ({ name: component.name, value: formatN(amounts[index] ?? 0) })).filter((line) => line.value !== '0.00');

    return {
      key: row.code,
      title: row.ename,
      subtitle: `${row.code}${row.desig ? ` - ${row.desig}` : ''}`,
      facts: [
        { label: 'Salary difference', value: formatN(row.salaryTotal) },
        { label: 'Deduction difference', value: formatN(row.deductionTotal) },
        { label: 'Net Payable', value: formatN(row.net), strong: true },
      ],
      sections: [
        { title: 'Salary differences', lines: lines(report.salaryComponents, row.salary) },
        { title: 'Deduction differences', lines: lines(report.deductionComponents, row.deductions) },
      ].filter((section) => section.lines.length > 0),
    };
  });

  return {
    banner: [report.companyName, `Period: ${monthLabel(report.startPeriod)}  To: ${monthLabel(report.endPeriod)}`].filter((line): line is string => !!line),
    groups: [{ key: 'rows', cards }],
    total: null,
    isEmpty: cards.length === 0,
  };
}

/** The variance report: defaults from GET /admin/cost-analysis-report, the report from .../report. */
export function useCostAnalysis() {
  const defaultsQuery = useQuery({ queryKey: ['admin', 'cost-analysis', 'defaults'], queryFn: fetchCostAnalysisDefaults });
  const [edits, setEdits] = useState<{ from?: string; to?: string }>({});
  const [submitted, setSubmitted] = useState<{ from: string; to: string } | null>(null);

  const from = edits.from ?? toYearMonth(defaultsQuery.data?.dateFrom ?? '');
  const to = edits.to ?? toYearMonth(defaultsQuery.data?.dateTo ?? '');

  const reportQuery = useQuery({
    queryKey: ['admin', 'cost-analysis', 'report', submitted?.from, submitted?.to],
    enabled: submitted !== null,
    staleTime: 0,
    retry: false,
    queryFn: () => fetchCostAnalysis(toServerMonth(submitted!.from), toServerMonth(submitted!.to)),
  });

  const model = useMemo(() => (reportQuery.data ? toModel(reportQuery.data) : null), [reportQuery.data]);

  const run = () => {
    if (from && to) {
      setSubmitted({ from, to });
    }
  };

  return {
    defaultsQuery,
    reportQuery,
    model,
    from,
    to,
    setFrom: (value: string) => setEdits((current) => ({ ...current, from: value })),
    setTo: (value: string) => setEdits((current) => ({ ...current, to: value })),
    canRun: !!from && !!to,
    run,
  };
}
