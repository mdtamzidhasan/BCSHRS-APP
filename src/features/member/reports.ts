import type { ReportFlags, ReportKind } from './api';

/** What a report needs from the Home filters. */
export type ReportInput = 'income_year' | 'month' | 'pf_year';

export interface ReportEntry {
  flag: keyof ReportFlags;
  kind: ReportKind;
  title: string;
  /** Route path of the viewer. */
  href: string;
  inputs: ReportInput[];
}

/** The Home report list in legacy order, each tied to the dashboard flag that allows it. */
export const REPORT_ENTRIES: ReportEntry[] = [
  { flag: 'payslip', kind: 'payslip', title: 'Payslip', href: '/member/reports/payslip', inputs: ['income_year', 'month'] },
  { flag: 'details', kind: 'employee-details', title: 'Employee Details', href: '/member/reports/employee-details', inputs: [] },
  { flag: 'salary_certificate', kind: 'salary-certificate', title: 'Salary Certificate', href: '/member/reports/salary-certificate', inputs: ['income_year'] },
  { flag: 'pfcertificate', kind: 'pf-certificate', title: 'PF Certificate', href: '/member/reports/pf-certificate', inputs: ['pf_year', 'month'] },
  { flag: 'investment', kind: 'investment-letter', title: 'Investment Letter', href: '/member/reports/investment-letter', inputs: ['income_year'] },
  { flag: 'tax_montly', kind: 'tax-monthly', title: 'Tax Computation (Monthly)', href: '/member/reports/tax-monthly', inputs: ['income_year', 'month'] },
  { flag: 'tax_yearly', kind: 'tax-yearly', title: 'Tax Computation (Yearly)', href: '/member/reports/tax-yearly', inputs: ['income_year'] },
  { flag: 'costtothecompany', kind: 'cost-to-the-company', title: 'Cost to the Company', href: '/member/reports/cost-to-the-company', inputs: ['income_year', 'month'] },
];

export const REPORT_TITLES = Object.fromEntries(REPORT_ENTRIES.map((entry) => [entry.kind, entry.title])) as Record<ReportKind, string>;
