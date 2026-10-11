import { api } from '@/api/client';

import type { ReportSlug } from './reports';

export interface SalaryEntryData {
  divisions: { div_name: string; div_code: string }[];
  locations: { branch_name: string; branch_code: string }[];
  costCenters: { name: string; code: string }[];
  incomeYears: string[];
  employeeCategories: string[];
  currencies: string[];
  /** "YYYY-MM" of the current payroll month, or null. */
  defaultPeriod: string | null;
  reportAccess: Record<string, boolean>;
}

export interface EmployeeBrief {
  code: string;
  ename: string;
  desig: string;
}

export interface EmployeeListRow extends EmployeeBrief {
  dept: string | null;
}

export interface EmployeeListPage {
  employees: EmployeeListRow[];
  total: number;
  page: number;
  pageSize: number;
  lastPage: number;
}

export interface Component {
  name: string;
  sl: number;
  category: string;
}

/** A PHP associative array that is empty arrives as `[]`. */
export type TotalsMap = Record<string, number> | never[];

export interface ReportBanner {
  reportHeader?: string;
  companyName?: string;
  dateFrom?: string;
  dateTo?: string;
  hasRecords?: boolean;
}

/** Reports #1-#9, #14 (and cost-center summary): one row per employee (or month). */
export interface SheetResponse extends ReportBanner {
  groupByMonth?: boolean;
  isCostCenterSummary?: boolean;
  employees: EmployeeBrief[];
  months?: number[];
  salaryComponents: Component[];
  deductionComponents: Component[];
  employeeComponentTotals: TotalsMap;
  itemTotals: TotalsMap;
}

/** Report #3 with "Select All" cost centers. */
export interface CostCenterEmployeesResponse extends ReportBanner {
  costcenters: { code: string; name: string }[];
  employees: { code: string; ename: string; costcenterCode: string }[];
  salaryComponents: Component[];
  deductionComponents: Component[];
  costcenterComponentTotals: TotalsMap;
  costcenterEmployeeComponentTotals: TotalsMap;
  itemTotals: TotalsMap;
}

/** Report #13. */
export interface LocationCostCenterResponse extends ReportBanner {
  branches: { code: string; name: string }[];
  costcenters: { branchCode: string; name: string }[];
  salaryComponents: Component[];
  deductionComponents: Component[];
  branchComponentTotals: TotalsMap;
  branchCostcenterComponentTotals: TotalsMap;
  itemTotals: TotalsMap;
}

/** Report #10. */
export interface Section50Response extends ReportBanner {
  employees: { code: string; ename: string; desig: string; tin: string; taxDeduction: number }[];
  employeeColumnTotals: TotalsMap;
  taxChallans: { emp_code: string; challan_no: string; challan_date: string; bank: string; total_amt: number }[];
}

export interface VerticalRow {
  emp_code?: string;
  ename?: string;
  desig?: string;
  costcenter_code?: string;
  costcenter?: string;
  cat?: string;
  item: string;
  s_code?: string | null;
  sub_code?: string | null;
  amt: number | string;
}

/** Reports #11 and #12 ("Select All"). */
export interface VerticalResponse {
  companyName?: string;
  period?: string;
  rows: VerticalRow[];
}

export type ReportResponse = SheetResponse | CostCenterEmployeesResponse | LocationCostCenterResponse | Section50Response | VerticalResponse;

export type ReportParams = Record<string, string>;

export async function fetchSalaryEntry(): Promise<SalaryEntryData> {
  return (await api.get<SalaryEntryData>('/admin/salary-reports')).data;
}

export async function searchEmployee(code: string): Promise<EmployeeBrief | null> {
  const { data } = await api.get<{ employee: EmployeeBrief | null }>('/admin/salary-reports/employees/search', { code });

  return data.employee;
}

export async function fetchEmployeeList(search: string, page: number): Promise<EmployeeListPage> {
  return (await api.get<EmployeeListPage>('/admin/salary-reports/employees', { search: search || undefined, page, pageSize: 25 })).data;
}

export async function fetchSalaryReport(slug: ReportSlug, params: ReportParams): Promise<ReportResponse> {
  return (await api.get<ReportResponse>(`/admin/salary-reports/${slug}`, params)).data;
}

export interface CostAnalysisDefaults {
  dateFrom: string;
  dateTo: string;
}

export interface CostAnalysisRow {
  code: string;
  ename: string;
  desig: string;
  salary: number[];
  salaryTotal: number;
  deductions: number[];
  deductionTotal: number;
  net: number;
}

export interface CostAnalysisResponse {
  companyName: string | null;
  startPeriod: string;
  endPeriod: string;
  salaryComponents: Component[];
  deductionComponents: Component[];
  rows: CostAnalysisRow[];
}

export async function fetchCostAnalysisDefaults(): Promise<CostAnalysisDefaults> {
  return (await api.get<CostAnalysisDefaults>('/admin/cost-analysis-report')).data;
}

export async function fetchCostAnalysis(dateFrom: string, dateTo: string): Promise<CostAnalysisResponse> {
  return (await api.get<CostAnalysisResponse>('/admin/cost-analysis-report/report', { DateFrom: dateFrom, DateTo: dateTo })).data;
}
