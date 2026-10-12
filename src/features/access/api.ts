import { api, type Paginated } from '@/api/client';

/** Request functions and response types of the access-control endpoints (routes/api/v1/admin-access.php). */

// ------------------------------------------------------------------ shared types
export interface Role {
  RoleId: string;
  RoleName: string;
  Description?: string | null;
  user_roles_count?: number;
}

export interface Membership {
  Email?: string | null;
  Comment?: string | null;
  IsApproved?: boolean;
  IsLockedOut?: boolean;
}

export interface AdminUser {
  UserId: string;
  UserName: string;
  IsOnline?: boolean;
  membership?: Membership | null;
  detail?: { EmployeeId?: string | null } | null;
}

export interface Company {
  id: number;
  cname: string;
  company_code?: string | null;
}

/** A row of the by-role / by-company listings. */
export interface ListedUser {
  UserId: string;
  UserName: string;
  Email: string;
  CreationDate: string;
  LastLoginDate: string;
  LastActivityDate: string;
  IsApproved: boolean;
  IsOnline: boolean;
  IsLockedOut: boolean;
}

export interface UserRoleAssignment {
  UserRoleId: number;
  UserName: string;
  RoleId: string;
  CompanyProfileId: number;
  role?: Role | null;
  company_profile?: Company | null;
}

export interface WebEvent {
  WebEventId: number;
  FormName: string;
  ActionName?: string | null;
  Description?: string | null;
}

export interface WebMenu {
  Id: number;
  MenuName: string;
  MenuLocation: string;
  ParentId: number;
}

export interface SuperAdmin {
  Id: number;
  UserName: string;
  DomainName: string;
  IsActive: boolean;
}

export type Flags = Record<string, boolean>;
/** Laravel keyed collections arrive as an object, or as an empty array when empty. */
export type Keyed<T> = Record<string, T> | never[];

interface Answer<T> {
  message: string | null;
  data: T;
}

// ------------------------------------------------------------------ roles
export const rolesApi = {
  list: async () => (await api.get<{ roles: Role[] }>('/admin/roles')).data.roles,
  create: (roleName: string): Promise<Answer<null>> => api.post<null>('/admin/roles', { role_name: roleName }),
  remove: (roleName: string): Promise<Answer<null>> => api.delete<null>('/admin/roles', { role_name: roleName }),
};

// ------------------------------------------------------------------ users
export interface UserFilters {
  search: string;
  status: string;
  locked: string;
  online: string;
  role: string;
  sort: string;
}

export interface UsersPage {
  users: Paginated<AdminUser>;
  roles: Role[];
}

export interface UserInput {
  email: string;
  comment: string;
  is_approved: boolean;
  is_online: boolean;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_id: string;
  role_id: string;
  employee_id: string;
  mobile: string;
  job_code: string;
  is_approved: boolean;
}

export const usersApi = {
  page: async (filters: UserFilters, page: number) => {
    const params: Record<string, unknown> = { page };

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params[key] = value;
      }
    }

    return (await api.get<UsersPage>('/admin/users', params)).data;
  },
  formData: async () => (await api.get<{ companies: Company[]; roles: Role[] }>('/admin/users/create')).data,
  one: async (id: string) => (await api.get<{ user: AdminUser }>(`/admin/users/${id}`)).data.user,
  create: (input: CreateUserInput): Promise<Answer<null>> => api.post<null>('/admin/users', input),
  update: (id: string, input: UserInput): Promise<Answer<null>> => api.put<null>(`/admin/users/${id}`, input),
  unlock: (id: string): Promise<Answer<{ user: AdminUser }>> => api.post<{ user: AdminUser }>(`/admin/users/${id}/unlock`),
  remove: (id: string): Promise<Answer<null>> => api.delete<null>(`/admin/users/${id}`),
  byRole: async (role: string, page: number) =>
    (await api.get<{ roles: string[]; selectedRole: string; users: Paginated<ListedUser> }>('/admin/users-by-role', { role: role || undefined, page })).data,
  byCompany: async () => (await api.get<{ users: ListedUser[] }>('/admin/users-by-company')).data.users,
};

// ------------------------------------------------------------------ user role assignment
export interface AssignmentData {
  assignments: UserRoleAssignment[];
  roles: Role[];
  users: { usr: string }[];
  companies: Company[];
}

export interface AssignmentInput {
  id: number | null;
  role_id: string;
  user_name: string;
  company_id: number;
}

export const assignmentApi = {
  load: async () => (await api.get<AssignmentData>('/admin/user-role-assignment')).data,
  save: (input: AssignmentInput): Promise<Answer<null>> => api.post<null>('/admin/user-role-assignment', input),
  remove: (id: number): Promise<Answer<null>> => api.delete<null>('/admin/user-role-assignment', { id }),
};

// ------------------------------------------------------------------ web events (Web Report) and web menus
export interface WebEventInput {
  FormName: string;
  ActionName: string;
  Description: string;
}

export const webEventApi = {
  page: async (page: number) => (await api.get<{ webEvents: Paginated<WebEvent> }>('/admin/web-menu', { page })).data,
  one: async (id: string) => (await api.get<{ webEvent: WebEvent }>(`/admin/web-menu/${id}/edit`)).data.webEvent,
  create: (input: WebEventInput): Promise<Answer<null>> => api.post<null>('/admin/web-menu', input),
  update: (id: string, input: WebEventInput): Promise<Answer<null>> => api.put<null>(`/admin/web-menu/${id}`, input),
  remove: (id: number): Promise<Answer<null>> => api.delete<null>(`/admin/web-menu/${id}`),
};

export interface WebMenuInput {
  webMenuId: number | null;
  menuName: string;
  menuLocation: string;
  parentId: number;
}

export const webMenuApi = {
  list: async () => (await api.get<{ menus: WebMenu[] }>('/admin/menu-catalogue')).data.menus,
  save: (input: WebMenuInput): Promise<Answer<null>> => api.post<null>('/admin/menu-catalogue', input),
  remove: (webMenuId: number): Promise<Answer<null>> => api.delete<null>('/admin/menu-catalogue', { webMenuId }),
};

// ------------------------------------------------------------------ permission matrices
export interface RoleWebReport {
  WebReportId: number;
  ReportName: string;
  ReportSelect: boolean;
  CreateSelect: boolean;
  UpdateSelect: boolean;
  DeleteSelect: boolean;
}

export const roleReportApi = {
  load: async (roleId: string) =>
    (await api.get<{ roles: { RoleId: string; RoleName: string }[]; roleId: string | null; reports: RoleWebReport[] }>('/admin/role-web-reports', { role: roleId || undefined })).data,
  save: (roleId: string, reports: Record<string, Flags>): Promise<Answer<null>> => api.post<null>('/admin/role-web-reports', { role: roleId, reports }),
  remove: (roleId: string): Promise<Answer<null>> => api.delete<null>('/admin/role-web-reports', { role: roleId }),
};

export interface RoleWebMenu {
  WebMenuId: number;
  MenuName: string;
  MenuLocation: string;
  MenuSelect: boolean;
  CreateSelect: boolean;
  UpdateSelect: boolean;
  DeleteSelect: boolean;
}

export const roleMenuApi = {
  load: async (roleId: string) =>
    (await api.get<{ roles: { RoleId: string; RoleName: string }[]; roleId: string | null; menus: RoleWebMenu[] }>('/admin/role-web-menus', { role: roleId || undefined })).data,
  save: (roleId: string, menus: Record<string, Flags>): Promise<Answer<null>> => api.post<null>('/admin/role-web-menus', { role: roleId, menus }),
};

// ------------------------------------------------------------------ super admin
export interface SuperAdminInput {
  id: number | null;
  user_name: string;
  domain: string;
  is_active: boolean;
}

export const superAdminApi = {
  load: async () => (await api.get<{ superAdmins: SuperAdmin[]; users: { UserName: string }[] }>('/admin/super-admin')).data,
  save: (input: SuperAdminInput): Promise<Answer<null>> => api.post<null>('/admin/super-admin', input),
  remove: (id: number): Promise<Answer<null>> => api.delete<null>('/admin/super-admin', { id }),
};

// ------------------------------------------------------------------ report access
export const REPORT_ACCESS_FLAGS: { id: string; label: string }[] = [
  { id: 'chkPayslip', label: 'Payslip' },
  { id: 'chkEmpDetails', label: 'Employee Details' },
  { id: 'chkInvestmentLetter', label: 'Investment Letter' },
  { id: 'chkTaxMonthly', label: 'Tax Computation Monthly' },
  { id: 'chkTaxYearly', label: 'Tax Computation Yearly' },
  { id: 'chkPFReport', label: 'Investment report excluding pf from investment' },
  { id: 'chkPFCertificate', label: 'PF Certificate' },
  { id: 'chkSalaryCertificate', label: 'Salary Certificate' },
  { id: 'chkCostToTheCompanyReport', label: 'Cost to the company' },
  { id: 'chkPDFReport', label: 'Extra PDF Report' },
  { id: 'chkExcludingPF', label: 'Excluding Recognized PF' },
];

export interface MonthlyAccess {
  month: string;
  enableAll: boolean;
  noOfMonth: number | string | null;
}

export const reportAccessApi = {
  payroll: async () => (await api.get<{ checked: Flags }>('/admin/payroll-report-access')).data.checked,
  savePayroll: (flags: Flags): Promise<Answer<null>> => api.post<null>('/admin/payroll-report-access', flags),
  monthly: async () => (await api.get<MonthlyAccess>('/admin/monthly-payroll-report-access')).data,
  saveMonthly: (input: { MonthlyAccess: 'Disable' | 'Enable'; month: string; MonthNo: string }): Promise<Answer<null>> =>
    api.post<null>('/admin/monthly-payroll-report-access', input),
};

// ------------------------------------------------------------------ invalid credentials and change report
export interface InvalidLogin {
  user: string;
  is_approved: boolean;
  is_locked_out: boolean;
  ip: string;
  date: string;
}

export interface InvalidCredentialsPage {
  rows: InvalidLogin[];
  total: number;
  page: number;
  pageCount: number;
  searchErrors: string[];
}

export interface InvalidSearch {
  user: string;
  date_from: string;
  date_to: string;
  applied: boolean;
}

export const invalidCredentialsApi = {
  page: async (search: InvalidSearch, page: number) => {
    const params: Record<string, unknown> = { page };

    if (search.applied) {
      params.action = 'search';
      params.user = search.user;
      params.date_from = search.date_from;
      params.date_to = search.date_to;
    }

    return (await api.get<InvalidCredentialsPage>('/admin/invalid-credentials', params)).data;
  },
};

export type ChangeEventType = 'A' | 'M';

export interface AuditComment {
  Comments: string;
  UserName: string;
  DateTime: string;
  is_mine?: boolean;
}

export interface AuditReport {
  status: string;
  message?: string;
  type?: 'A' | 'M' | null;
  columns?: string[];
  rows?: {
    emp_code: string;
    emp_name: string | null;
    changes?: Record<string, { original: string | null; new: string | null } | null>;
    fields?: Record<string, unknown>;
  }[];
}

export interface AuditData {
  months: Record<string, string>;
  report: AuditReport | null;
  comments: AuditComment[];
  reportType: string;
}

export interface AuditQuery {
  income_year: string;
  month: string;
  event_type: ChangeEventType;
}

export const auditApi = {
  months: async () => (await api.get<AuditData>('/admin/audit-log')).data.months,
  report: async (query: AuditQuery) => (await api.get<AuditData>('/admin/audit-log', { ...query })).data,
  archive: (query: AuditQuery): Promise<Answer<null>> => api.post<null>('/admin/audit-log/archive', query),
  comment: (query: AuditQuery, comment: string): Promise<Answer<null>> =>
    api.post<null>('/admin/audit-log/comments', { income_year: query.income_year, month: query.month, report_type: query.event_type, comment }),
};
