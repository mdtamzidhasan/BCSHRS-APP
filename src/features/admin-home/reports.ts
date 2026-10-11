import type { ReportKey } from './api';

export type ReportNeeds = 'income_year' | 'month' | 'pf_year';

export interface ReportDef {
  key: ReportKey;
  title: string;
  /** Legacy action name used by the server's visibleActions list. */
  action: string;
  actionLabel: string;
  needs: ReportNeeds[];
}

export const REPORTS: ReportDef[] = [
  { key: 'payslip', title: 'Payslip with bank transfer details', action: 'Payslip', actionLabel: 'Generate Payslip', needs: ['income_year', 'month'] },
  { key: 'details', title: 'Employee details', action: 'Employee Details', actionLabel: 'View Details', needs: [] },
  { key: 'investment', title: 'Investment notification letter', action: 'Investment', actionLabel: 'View Letter', needs: ['income_year'] },
  { key: 'tax_yearly', title: 'Tax computation for the income year', action: 'Yearly Tax Computation', actionLabel: 'View Tax Computation', needs: ['income_year'] },
  { key: 'tax_montly', title: 'Tax computation for the month', action: 'Monthly Tax Computation', actionLabel: 'View Tax Computation', needs: ['income_year', 'month'] },
  { key: 'salary_certificate', title: 'Salary certificate', action: 'Salary Certificate', actionLabel: 'View Certificate', needs: ['income_year'] },
  { key: 'pfcertificate', title: 'PF certificate', action: 'PF Report', actionLabel: 'View PF Certificate', needs: ['pf_year', 'month'] },
  { key: 'costtothecompany', title: 'Cost to the company', action: 'Cost to the Company', actionLabel: 'View Cost', needs: ['income_year', 'month'] },
];

export const reportTitle = (key: string): string => REPORTS.find((report) => report.key === key)?.title ?? 'Report';

export const SCOPES = [
  { label: 'Single Employee', value: 1 },
  { label: 'All Employee', value: 2 },
  { label: 'Department', value: 3 },
  { label: 'Costcenter', value: 4 },
  { label: 'Employee Category', value: 5 },
] as const;
