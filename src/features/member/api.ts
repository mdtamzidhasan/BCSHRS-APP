import { api, ApiError } from '@/api/client';

export interface MonthOption {
  value: number;
  text: string;
}

/** Which self-service reports the company lets this member open (GET /member/dashboard → flags). */
export interface ReportFlags {
  payslip: boolean;
  details: boolean;
  investment: boolean;
  tax_montly: boolean;
  tax_yearly: boolean;
  salary_certificate: boolean;
  pdf: boolean;
  pfcertificate: boolean;
  costtothecompany: boolean;
}

export interface MemberDashboard {
  incomeYears: string[];
  months: MonthOption[];
  selectedMonthIndex: number | null;
  pfYears: string[];
  flags: ReportFlags;
  /** HTML message shown when the member has no valid mobile number. */
  notification: string | null;
}

export interface MemberPdf {
  description: string;
  pdf_url: string;
  edited_date: string | null;
}

export type ReportKind = 'payslip' | 'employee-details' | 'salary-certificate' | 'pf-certificate' | 'investment-letter' | 'tax-monthly' | 'tax-yearly' | 'cost-to-the-company';

export type ReportParams = Partial<Record<'income_year' | 'pf_year' | 'month', string>>;

/** A report JSON tree: sections of objects, lists and scalar values. */
export type ReportNode = string | number | boolean | null | ReportNode[] | { [key: string]: ReportNode };

export const getDashboard = async () => (await api.get<MemberDashboard>('/member/dashboard')).data;

export const getPdfs = async () => (await api.get<{ pdfs: MemberPdf[] | null }>('/member/pdfs')).data.pdfs ?? [];

const REPORT_URLS: Record<ReportKind, string> = {
  payslip: '/member/reports/payslip',
  'employee-details': '/member/reports/employee-details',
  'salary-certificate': '/member/reports/salary-certificate',
  'pf-certificate': '/member/reports/pf-certificate',
  'investment-letter': '/member/reports/investment-letter',
  'tax-monthly': '/member/reports/tax-computation/monthly',
  'tax-yearly': '/member/reports/tax-computation/yearly',
  'cost-to-the-company': '/member/reports/cost-to-the-company',
};

/** Some reports answer HTTP 200 with success:false (not available yet, no access) — raised as an error here. */
export async function getReport(kind: ReportKind, params: ReportParams): Promise<ReportNode> {
  const body = await api.get<ReportNode>(REPORT_URLS[kind], params);

  if (!body.success || body.data === null) {
    throw new ApiError(body.message ?? 'No data found.', 422, 'REPORT_UNAVAILABLE');
  }

  return body.data;
}

export const changePassword = (body: { old_password: string; new_password: string; new_password_confirmation: string }) => api.post<null>('/member/change-password', body);
export const changeUsername = (body: { new_username: string }) => api.post<null>('/member/change-username', body);
export const getCurrentMobile = async () => (await api.get<{ currentMobile: string | null }>('/member/add-mobile')).data.currentMobile;
export const addMobile = (body: { mobile: string }) => api.post<null>('/member/add-mobile', body);
export const sendContact = (body: { message: string }) => api.post<null>('/member/contact', body);
