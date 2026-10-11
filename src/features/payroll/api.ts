import { api } from '@/api/client';
import type { PickedFile } from '@/components/ui/misc';

// ------------------------------------------------------------------ payroll history
export interface PayrollHistory {
  Id: number;
  CalYear: string;
  Month: string;
  CompRef: string;
  TimeRef: string;
  Status: string;
  PayrollStatus: string;
  Creator: string;
  CreationDate: string;
  Remarks: string;
  ReviewerName: string;
  ReviewDate: string;
  RemarksByReviewer: string;
  ApproverName: string;
  ApprovedDate: string;
  RemarksByApprover: string;
}

export async function fetchPayrollHistory(): Promise<PayrollHistory[]> {
  return (await api.get<{ rows: PayrollHistory[] }>('/admin/payroll-history')).data.rows;
}

export async function fetchPayrollHistoryItem(id: string): Promise<PayrollHistory> {
  return (await api.get<{ history: PayrollHistory }>(`/admin/payroll-history/${id}`)).data.history;
}

// ------------------------------------------------------------------ PF year
export async function fetchCurrentPfYear(): Promise<string | null> {
  return (await api.get<{ currentYear: string | null }>('/admin/pf-year')).data.currentYear ?? null;
}

export async function createPfYear(dateFrom: string, dateTo: string) {
  return api.post<null>('/admin/pf-year', { DateFrom: dateFrom, DateTo: dateTo });
}

export async function advancePfYear() {
  return api.post<null>('/admin/pf-year/advance');
}

// ------------------------------------------------------------------ PF uploads (balance / profit allocation)
export type PfUploadKind = 'balance' | 'profit';

export interface PfYearOption {
  Id?: number;
  PFYear: string;
}

export interface PfUploadMeta {
  pfYears: PfYearOption[];
  /** field key => label */
  fields: Record<string, string>;
  /** month number => name (profit allocation only) */
  months?: Record<string, string>;
}

export interface PfPreviewRow {
  employee_code: string;
  name: string | null;
  designation: string | null;
  value: number;
  valid: boolean;
}

export interface PfPreview {
  rows: PfPreviewRow[];
  token: string;
}

export interface PfUploadParams {
  pfYear: string;
  field: string;
  month?: string;
  workSheet: string;
  empCol: string;
  valueCol: string;
}

const pfBase = (kind: PfUploadKind) => (kind === 'balance' ? '/admin/pf-balance-upload' : '/admin/pf-profit-allocation');

export async function fetchPfUploadMeta(kind: PfUploadKind): Promise<PfUploadMeta> {
  return (await api.get<PfUploadMeta>(pfBase(kind))).data;
}

export async function previewPfUpload(kind: PfUploadKind, file: PickedFile, params: PfUploadParams): Promise<PfPreview> {
  const response = await api.upload<PfPreview>(
    `${pfBase(kind)}/preview`,
    file,
    {
      pf_year: params.pfYear,
      field: params.field,
      month: kind === 'profit' ? params.month : undefined,
      work_sheet: params.workSheet,
      emp_col: params.empCol,
      value_col: params.valueCol,
    },
    'file',
  );

  return response.data;
}

export async function savePfUpload(kind: PfUploadKind, token: string, params: PfUploadParams) {
  return api.post<null>(pfBase(kind), {
    token,
    field: params.field,
    pf_year: params.pfYear,
    month: kind === 'profit' ? Number(params.month) : undefined,
    emp_col: Number(params.empCol),
    value_col: Number(params.valueCol),
  });
}

// ------------------------------------------------------------------ companies
export interface Company {
  id: number;
  company_code: string;
  cname: string;
  type: string;
}

export interface CompaniesData {
  companies: Company[];
  domains: string[];
}

export interface CompanyInput {
  txtCompanyCode: string;
  txtCompanyName: string;
  ddlDomain: string;
}

export async function fetchCompanies(): Promise<CompaniesData> {
  return (await api.get<CompaniesData>('/admin/companies')).data;
}

export const addCompany = (input: CompanyInput) => api.post<null>('/admin/companies', input);
export const updateCompany = (id: number, input: CompanyInput) => api.put<null>(`/admin/companies/${id}`, input);
export const deleteCompany = (id: number) => api.delete<null>(`/admin/companies/${id}`);

// ------------------------------------------------------------------ upload header
export const IMAGE_TYPES = ['Header', 'Footer', 'Signature', 'Logo'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

export async function uploadHeaderImage(file: PickedFile, imageType: ImageType) {
  return api.upload<{ imageType: string; preview: string }>('/admin/upload-header', file, { ImageType: imageType }, 'FileUpload1');
}

// ------------------------------------------------------------------ section 50 mapping
export interface Section50Component {
  code: string;
  name: string;
  section150: number;
}

export async function fetchSection50(): Promise<Section50Component[]> {
  return (await api.get<{ components: Section50Component[] }>('/admin/section-50-mapping')).data.components;
}

export const SECTION_50_OPTIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export async function saveSection50(components: Section50Component[]) {
  return api.post<null>(
    '/admin/section-50-mapping',
    components.map((component) => ({ ComponentCode: component.code, ComponentName: component.name, Section150: component.section150 })),
  );
}

// ------------------------------------------------------------------ salary / deduction components
export type ComponentKind = 'salary' | 'deduction';

export interface ComponentGroup {
  id?: number | string;
  group_id: string;
  group_name: string;
}

export interface MappingComponent {
  comp_code: string;
  comp_name: string;
  selected?: boolean;
}

export interface SortRow {
  comp_code: string;
  comp_name: string;
  s_code: string;
  sname: string;
  comp_sl: number;
  group_id: string | null;
}

export interface SortSave {
  component_code: string;
  sub_code: string;
  sl: string;
  group_id: string;
}

const compBase = (kind: ComponentKind) => `/admin/${kind}-components`;

export async function fetchGroups(kind: ComponentKind): Promise<ComponentGroup[]> {
  return (await api.get<{ groups: ComponentGroup[] }>(`${compBase(kind)}/groups`)).data.groups;
}

export const saveGroup = (kind: ComponentKind, input: { id?: number | string; group_id: string; group_name: string }) =>
  api.post<null>(`${compBase(kind)}/groups`, { id: input.id ? Number(input.id) : undefined, group_id: input.group_id, group_name: input.group_name });

export const deleteGroup = (kind: ComponentKind, groupId: string) => api.delete<null>(`${compBase(kind)}/groups`, { group_id: groupId });

export async function fetchMapping(kind: ComponentKind, groupId: string | null): Promise<{ groups: ComponentGroup[]; components: MappingComponent[] }> {
  return (await api.get<{ groups: ComponentGroup[]; components: MappingComponent[] }>(`${compBase(kind)}/mapping`, groupId ? { group_id: groupId } : undefined)).data;
}

export const saveMapping = (kind: ComponentKind, groupId: string, codes: string[]) => api.post<{ group_id: string }>(`${compBase(kind)}/mapping`, { group_id: groupId, component_codes: codes });

export async function fetchSorting(kind: ComponentKind): Promise<{ groups: ComponentGroup[]; components: SortRow[] }> {
  return (await api.get<{ groups: ComponentGroup[]; components: SortRow[] }>(`${compBase(kind)}/sorting`)).data;
}

export const saveSorting = (kind: ComponentKind, rows: SortSave[]) => api.post<null>(`${compBase(kind)}/sorting`, { rows });

// ------------------------------------------------------------------ salary approval
export type ApprovalPage = 'creator' | 'reviewer' | 'approver';

export interface ApprovalSummaryRow {
  Currency: string;
  TotalEmpCount: number;
  TotalSalary: string;
  Amount: string;
}

export interface ApprovalPageData {
  page: ApprovalPage;
  heading: string;
  title: string;
  companyName: string | null;
  startPeriod: string;
  endPeriod: string;
  data: ApprovalSummaryRow[];
  /** Non-empty when the page shows only a message (no payroll in this status / no permission). */
  table: string;
}

export interface ApprovalFilter {
  dateFrom: string;
  dateTo: string;
  currency: string;
}

export async function fetchApprovalPage(page: ApprovalPage, filter: ApprovalFilter): Promise<ApprovalPageData> {
  return (await api.get<ApprovalPageData>(`/admin/salary-approval/${page}`, { date_from: filter.dateFrom, date_to: filter.dateTo, currency: filter.currency })).data;
}

export function submitApproval(page: ApprovalPage, remarks: string, reprocess: boolean) {
  const url = page === 'creator' ? '/admin/salary-approval/creator/request' : `/admin/salary-approval/${page}/approval`;

  return api.post<null>(url, page === 'creator' ? { Remarks: remarks } : { Remarks: remarks, Reprocess: reprocess });
}
