import { api } from '@/api/client';

export interface TextOption {
  value: string | number;
  text: string;
}

export interface HomeOptions {
  months: { value: number; text: string }[];
  incomeYears: string[];
  pfYears: string[];
  departments: string[];
  costCenters: TextOption[];
  employeeCategories: string[];
  visibleActions: string[];
  allowedActions: string[];
}

export interface EmployeeHit {
  code: string;
  name: string;
  designation: string | null;
  department?: string | null;
  username?: string | null;
}

export interface EmployeeLookup {
  code: string;
  name: string;
  designation: string;
}

export interface PdfItem {
  description: string;
  pdf_url: string;
  edited_date: string | null;
}

/** Report keys of the home page (AdminHomeController::REPORTS). */
export type ReportKey = 'payslip' | 'details' | 'investment' | 'tax_yearly' | 'tax_montly' | 'salary_certificate' | 'pfcertificate' | 'costtothecompany';

/** 1 Single Employee, 2 All Employee, 3 Department, 4 Costcenter, 5 Employee Category. */
export type ReportScope = 1 | 2 | 3 | 4 | 5;

export interface ReportParams {
  employee_code?: string;
  income_year?: string;
  month?: string;
  pf_year?: string;
}

export interface BulkParams extends ReportParams {
  type: ReportScope;
  value: string;
}

export interface BulkReportEntry {
  employee_code: string;
  success: boolean;
  message: string | null;
  data: unknown;
}

export interface Dashboard {
  company: Record<string, unknown>;
  role: Record<string, unknown>;
  tenantConnection?: string;
  summary: unknown;
  responsibilities: unknown;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const REPORT_ENDPOINTS: Record<ReportKey, string> = {
  payslip: '/admin/reports/payslip',
  details: '/admin/reports/employee-details',
  investment: '/admin/reports/investment-letter',
  tax_yearly: '/admin/reports/tax-computation/yearly',
  tax_montly: '/admin/reports/tax-computation/monthly',
  salary_certificate: '/admin/reports/salary-certificate',
  pfcertificate: '/admin/reports/pf-certificate',
  costtothecompany: '/admin/reports/cost-to-the-company',
};

export const getHome = async () => (await api.get<HomeOptions>('/admin/home')).data;

export const searchEmployees = async (term: string) => (await api.get<EmployeeHit[]>('/admin/employees/search', { term })).data;

export const lookupEmployee = async (empcode: string) => (await api.get<EmployeeLookup | null>('/admin/home/employee', { empcode })).data;

export const getPdfs = async (empcode: string) => (await api.get<{ pdfs: PdfItem[] | null }>('/admin/home/pdfs', { empcode })).data;

export const getReport = async (report: ReportKey, params: ReportParams) => (await api.get<unknown>(REPORT_ENDPOINTS[report], { ...params })).data;

export const getBulkCodes = async (report: ReportKey, params: BulkParams) =>
  (await api.get<{ codes: string[] | null }>(`/admin/home/list/${report}`, { ...params })).data;

export const getBulkPrint = async (report: ReportKey, params: BulkParams) =>
  (await api.get<{ reports: BulkReportEntry[] }>(`/admin/home/print/${report}`, { ...params })).data;

export const getDashboard = async () => (await api.get<Dashboard>('/admin/dashboard')).data;

export const changePassword = (input: ChangePasswordInput) => api.post<null>('/admin/change-password', input);
