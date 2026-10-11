import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { matrixApi, reportAccessApi, roleReportApi, REPORT_ACCESS_FLAGS, type Flags, type Keyed } from './api';
import { accessKey, useSave } from './use-save';

export interface MatrixColumn {
  key: string;
  label: string;
}

export interface MatrixItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface MatrixModel {
  roleName: string;
  items: MatrixItem[];
  /** Current switches per item id (every column present). */
  initial: Record<string, Flags>;
}

export const EVENT_COLUMNS: MatrixColumn[] = [
  { key: 'CanRead', label: 'Can Read' },
  { key: 'CanCreate', label: 'Can Create' },
  { key: 'CanUpdate', label: 'Can Update' },
  { key: 'CanDelete', label: 'Can Delete' },
];

export const MENU_COLUMNS: MatrixColumn[] = [
  { key: 'Active', label: 'Menu' },
  { key: 'CanCreate', label: 'Can Create' },
  { key: 'CanUpdate', label: 'Can Update' },
  { key: 'CanDelete', label: 'Can Delete' },
];

export const REPORT_COLUMNS: MatrixColumn[] = [
  { key: 'ReportSelect', label: 'Can Read' },
  { key: 'CreateSelect', label: 'Can Create' },
  { key: 'UpdateSelect', label: 'Can Update' },
  { key: 'DeleteSelect', label: 'Can Delete' },
];

/** A Laravel keyed collection is `{}` or `[]` when empty; reads the entry of one id. */
function entry<T>(keyed: Keyed<T>, id: string | number): T | undefined {
  return Array.isArray(keyed) ? undefined : keyed[String(id)];
}

function flagsOf(source: Record<string, unknown> | undefined, columns: MatrixColumn[]): Flags {
  return Object.fromEntries(columns.map((column) => [column.key, !!source?.[column.key]]));
}

// ------------------------------------------------------------------ Role Web Event (permissions)
export function useEventMatrix(roleId: string) {
  return useQuery({
    queryKey: accessKey('permissions', roleId),
    queryFn: () => matrixApi.events(roleId),
    select: (data): MatrixModel => ({
      roleName: data.role.RoleName,
      items: data.webEvents.map((event) => ({ id: String(event.WebEventId), title: event.FormName, subtitle: event.Description ?? event.ActionName ?? undefined })),
      initial: Object.fromEntries(data.webEvents.map((event) => [String(event.WebEventId), flagsOf(entry(data.currentPermissions, event.WebEventId), EVENT_COLUMNS)])),
    }),
  });
}

export function useSaveEventMatrix(roleId: string) {
  return useSave((values: Record<string, Flags>) => matrixApi.saveEvents(roleId, values), [accessKey('permissions', roleId)], { fallback: 'Permissions saved successfully.' });
}

// ------------------------------------------------------------------ Role Web Menu (menu-permissions)
export function useMenuMatrix(roleId: string) {
  return useQuery({
    queryKey: accessKey('menu-permissions', roleId),
    queryFn: () => matrixApi.menus(roleId),
    select: (data): MatrixModel => ({
      roleName: data.role.RoleName,
      items: data.webMenus.map((menu) => ({ id: String(menu.MenuId), title: menu.MenuName, subtitle: menu.parent?.MenuName })),
      initial: Object.fromEntries(data.webMenus.map((menu) => [String(menu.MenuId), flagsOf(entry(data.currentPermissions, menu.MenuId), MENU_COLUMNS)])),
    }),
  });
}

export function useSaveMenuMatrix(roleId: string) {
  return useSave((values: Record<string, Flags>) => matrixApi.saveMenus(roleId, values), [accessKey('menu-permissions', roleId)], { fallback: 'Menu permissions saved successfully.' });
}

/** The role list that opens a matrix (`permissions` or `menu-permissions`). */
export function useMatrixRoles(base: 'permissions' | 'menu-permissions') {
  return useQuery({ queryKey: accessKey(base, 'roles'), queryFn: () => matrixApi.roles(base) });
}

// ------------------------------------------------------------------ Role Web Report
export function useRoleWebReports() {
  const [roleId, setRoleId] = useState('');
  const query = useQuery({
    queryKey: accessKey('role-web-reports', roleId),
    queryFn: () => roleReportApi.load(roleId),
    select: (data) => ({
      roles: data.roles,
      model: {
        roleName: '',
        items: data.reports.map((report) => ({ id: String(report.WebReportId), title: report.ReportName })),
        initial: Object.fromEntries(data.reports.map((report) => [String(report.WebReportId), flagsOf(report as unknown as Record<string, unknown>, REPORT_COLUMNS)])),
      } satisfies MatrixModel,
    }),
  });
  const invalidate = [accessKey('role-web-reports')];
  const save = useSave((values: Record<string, Flags>) => roleReportApi.save(roleId, values), invalidate, { fallback: 'Saved Role Information.' });
  const remove = useSave(() => roleReportApi.remove(roleId), invalidate, { fallback: 'Successful.' });

  return { roleId, setRoleId, query, save, remove };
}

// ------------------------------------------------------------------ Report access
export function usePayrollAccess() {
  const query = useQuery({
    queryKey: accessKey('payroll-report-access'),
    queryFn: reportAccessApi.payroll,
    select: (checked): Flags => Object.fromEntries(REPORT_ACCESS_FLAGS.map((flag) => [flag.id, !!checked[flag.id]])),
  });
  const save = useSave((flags: Flags) => reportAccessApi.savePayroll(flags), [accessKey('payroll-report-access')], { fallback: 'Company data updated.' });

  return { query, save };
}

export function useMonthlyAccess() {
  const query = useQuery({ queryKey: accessKey('monthly-payroll-report-access'), queryFn: reportAccessApi.monthly });
  const save = useSave(reportAccessApi.saveMonthly, [accessKey('monthly-payroll-report-access')], { fallback: 'Save successful.' });

  return { query, save };
}
