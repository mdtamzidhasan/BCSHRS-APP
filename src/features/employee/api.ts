import { api, type Paginated } from '@/api/client';
import type { PickedFile } from '@/components/ui/misc';

const BASE = '/admin';

// ------------------------------------------------------------------ employee basic info
export type EmployeeRecord = Record<string, string | number | boolean | null | undefined>;

export const employeeApi = {
  /** `search`: the typed text anywhere in the employee code or name (the server searches the whole company, not only the loaded pages). */
  async list(page: number, search = ''): Promise<Paginated<EmployeeRecord>> {
    const res = await api.get<{ employees: Paginated<EmployeeRecord> }>(`${BASE}/employee-basic-info`, { page, search: search || undefined });
    return res.data.employees;
  },
  async get(code: string): Promise<EmployeeRecord> {
    const res = await api.get<{ employee: EmployeeRecord }>(`${BASE}/employee-basic-info/${encodeURIComponent(code)}`);
    return res.data.employee;
  },
  async save(body: Record<string, unknown>): Promise<string> {
    const res = await api.post<null>(`${BASE}/employee-basic-info`, body);
    return res.message ?? 'Employee saved successfully.';
  },
};

const LOOKUPS = `${BASE}/employee-basic-info/lookups`;

async function strings(path: string, params?: Record<string, unknown>): Promise<string[]> {
  return (await api.get<string[]>(`${LOOKUPS}/${path}`, params)).data;
}

export const formLookups = {
  jobSpaces: (spaceType: string) => strings('job-spaces', { space_type: spaceType }),
  designations: (spaceType: string, jobSpace: string) => strings('designations', { space_type: spaceType, job_space: jobSpace }),
  async location(designation: string): Promise<string> {
    return (await api.get<string>(`${LOOKUPS}/location`, { designation })).data;
  },
  async costCenter(designation: string): Promise<{ code: string; name: string }> {
    return (await api.get<{ code: string; name: string }>(`${LOOKUPS}/cost-center`, { designation })).data;
  },
  empCategories: () => strings('emp-categories'),
  gradeCategories: () => strings('grade-categories'),
  salaryCircles: () => strings('salary-circles'),
  taxZones: () => strings('tax-zones'),
  companyBanks: () => strings('company-banks'),
  employeeBranches: (bank: string) => strings('employee-bank-branches', { bank }),
  companyBranches: (bank: string) => strings('company-bank-branches', { bank }),
  companyAccounts: (bank: string, branch: string) => strings('company-bank-accounts', { bank, branch }),
};

// ------------------------------------------------------------------ job info
export interface JobEmployee {
  EmployeeCode: string;
  EmployeeName: string;
  EmployeeDesignation: string;
  Dept: string;
  WsType: string;
  WsName: string;
  GradeCategory: string;
  Grade: string;
  GradeStep: string;
  GrossSalary: string;
  CalculatedSalary: string;
}

export interface JobEarning {
  CompCode: string;
  CompName: string;
  CashAmount: string;
  NonCash: string;
  NonCashAmount: string;
  Remarks: string;
  Monthly: boolean;
}

/** Keys: EmpCode, CompanyCode, Option<Name> (boolean), <Name> (caption), ded_* (amount). */
export type JobDeduction = Record<string, string | boolean>;

export interface JobTransfer {
  EmpCode: string;
  Desig: string;
  Dept: string;
  WsName: string;
  Grade: string;
  WsType: string;
  GradeCategory: string;
  GradeStep: string;
  ActType: string;
  Rmk: string;
  ActDate: string;
  EffDate: string;
}

export interface JobInfoPayload {
  AddTransfer: boolean;
  Transfer: JobTransfer;
  AddEarning: boolean;
  Earnings: JobEarning[] | null;
  AddDeduction: boolean;
  Deduction: JobDeduction | null;
}

export const jobInfoApi = {
  async access(): Promise<{ hasCreateAccess: boolean; hasUpdateAccess: boolean }> {
    return (await api.get<{ hasCreateAccess: boolean; hasUpdateAccess: boolean }>(`${BASE}/job-info`)).data;
  },
  async employees(): Promise<JobEmployee[]> {
    return (await api.get<JobEmployee[]>(`${BASE}/job-info/employees`)).data;
  },
  async gradeCategories(): Promise<string[]> {
    return (await api.get<string[]>(`${BASE}/job-info/grade-categories`)).data;
  },
  async jobSpaces(spaceType: string): Promise<string[]> {
    return (await api.get<string[]>(`${BASE}/job-info/job-spaces`, { space_type: spaceType })).data;
  },
  async designations(spaceType: string, jobSpace: string): Promise<string[]> {
    return (await api.get<string[]>(`${BASE}/job-info/designations`, { space_type: spaceType, job_space: jobSpace })).data;
  },
  async earnings(code: string): Promise<JobEarning[]> {
    return (await api.get<JobEarning[]>(`${BASE}/job-info/earnings`, { code })).data;
  },
  async deduction(code: string): Promise<JobDeduction> {
    return (await api.get<JobDeduction>(`${BASE}/job-info/deduction`, { code })).data;
  },
  async save(payload: JobInfoPayload): Promise<void> {
    await api.post<{ message: string }>(`${BASE}/job-info`, payload);
  },
};

// ------------------------------------------------------------------ lookup master
export interface BankRow {
  BankName: string;
  Description: string;
}
export interface BranchRow {
  BankName: string;
  BranchName: string;
  Description: string;
}
export interface LookupMasterData {
  salaryCircles: string[];
  taxZones: string[];
  banks: BankRow[];
  bank: string;
  branches: BranchRow[];
}

export type LookupKind = 'salary-circles' | 'tax-zones' | 'banks' | 'branches';

export const lookupMasterApi = {
  async get(bank: string): Promise<LookupMasterData> {
    return (await api.get<LookupMasterData>(`${BASE}/lookup-master`, bank ? { bank } : undefined)).data;
  },
  async save(kind: LookupKind, body: Record<string, string>): Promise<string> {
    return (await api.post<unknown>(`${BASE}/lookup-master/${kind}`, body)).message ?? 'Saved';
  },
  async remove(kind: LookupKind, body: Record<string, string>): Promise<string> {
    return (await api.delete<unknown>(`${BASE}/lookup-master/${kind}`, body)).message ?? 'Deleted';
  },
};

// ------------------------------------------------------------------ upload excel (new employees)
export const EMPLOYEE_TEMPLATE = {
  path: `${BASE}/upload-excel/template`,
  fileName: 'employee-upload-template.xlsx',
  mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export interface UploadPreviewCell {
  value: string | number | null;
  expected_type: string;
  is_valid: boolean;
}
export interface UploadPreviewRow {
  row_number: number;
  employee_code: string;
  cells: UploadPreviewCell[];
}
export interface UploadPreview {
  token: string;
  rows: UploadPreviewRow[];
  invalidCount: number;
  columnCount: number;
  sheetName?: string;
}

/** The uploaded workbook: its worksheet names (in order) to pick from, and the token that stands for the file. */
export interface UploadedWorkbook {
  token: string;
  fileName: string;
  sheets: string[];
}

export const uploadExcelApi = {
  /** LEGACY UploadFile: keeps the file on the server and answers its worksheets. */
  async sheets(file: PickedFile): Promise<UploadedWorkbook> {
    return (await api.upload<UploadedWorkbook>(`${BASE}/upload-excel/sheets`, file, {}, 'file')).data;
  },
  /** Reads the chosen worksheet (`sheet` = its position) of the uploaded file and checks it. */
  async preview(token: string, sheet: number): Promise<UploadPreview> {
    return (await api.post<UploadPreview>(`${BASE}/upload-excel/preview`, { token, sheet })).data;
  },
  async confirm(token: string): Promise<string> {
    return (await api.post<{ count: number }>(`${BASE}/upload-excel/confirm`, { token })).message ?? 'Imported.';
  },
};

// ------------------------------------------------------------------ upload excel data
export interface UploadDataRow {
  Id: number;
  EmployeeCode: string;
  EmployeeName: string;
  EmployeeDesignation: string;
  FieldValue: string;
  Status: boolean;
}
export interface UploadDataForm {
  work_sheet?: string;
  info_type?: string;
  field_name?: string;
  code_col?: number | string;
  value_col?: number | string;
  income_year?: string;
  processed_month?: string;
}
export interface UploadDataPage {
  token: string | null;
  fileName: string | null;
  sheets: string[];
  /** An empty PHP array serialises as []. */
  form: UploadDataForm | unknown[];
  rows: UploadDataRow[] | null;
  infoTypes: string[];
  monthNames: string[];
  incomeYears: string[];
  fieldNames: Record<string, string[]> | unknown[];
}
export interface ReadDataBody {
  token: string;
  work_sheet: string;
  info_type: string;
  field_name: string;
  code_col: number;
  value_col: number;
  income_year?: string;
  processed_month?: string;
}

export const uploadDataApi = {
  async upload(file: PickedFile): Promise<UploadDataPage> {
    return (await api.upload<UploadDataPage>(`${BASE}/upload-excel/data/upload`, file, {}, 'file')).data;
  },
  async read(body: ReadDataBody): Promise<UploadDataPage> {
    return (await api.post<UploadDataPage>(`${BASE}/upload-excel/data/read`, body)).data;
  },
  async save(token: string): Promise<string> {
    return (await api.post<unknown>(`${BASE}/upload-excel/data/save`, { token })).message ?? 'Saved Employee Information.';
  },
};

// ------------------------------------------------------------------ instant message
export interface MessageEmployee {
  code: string;
  ename: string;
  desig: string;
  dept: string;
  mobile: string;
}
export interface MessageFilters {
  departments: string[];
  costCenters: { value: string; text: string }[];
}

export const instantMessageApi = {
  async filters(): Promise<MessageFilters> {
    return (await api.get<MessageFilters>(`${BASE}/instant-message`)).data;
  },
  /** type: 2 = all employees, 3 = department (by name), 4 = cost center (by code). */
  async employees(type: 2 | 3 | 4, value: string): Promise<MessageEmployee[]> {
    return (await api.get<MessageEmployee[]>(`${BASE}/instant-message/employees`, { type, value })).data;
  },
  async send(employees: { ename: string; mobile: string; description: string }[]): Promise<string> {
    return (await api.post<{ message: string }>(`${BASE}/instant-message/send`, { employees })).data.message;
  },
};
