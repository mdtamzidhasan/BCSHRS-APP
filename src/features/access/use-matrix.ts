import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { reportAccessApi, roleMenuApi, roleReportApi, REPORT_ACCESS_FLAGS, type Flags } from './api';
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

export const MENU_COLUMNS: MatrixColumn[] = [
  { key: 'Active', label: 'Can Read' },
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

function flagsOf(source: Record<string, unknown> | undefined, columns: MatrixColumn[]): Flags {
  return Object.fromEntries(columns.map((column) => [column.key, !!source?.[column.key]]));
}

// ------------------------------------------------------------------ Role Web Menu
export function useRoleWebMenus() {
  const [roleId, setRoleId] = useState('');
  const query = useQuery({
    queryKey: accessKey('role-web-menus', roleId),
    queryFn: () => roleMenuApi.load(roleId),
    select: (data) => ({
      roles: data.roles,
      model: {
        roleName: '',
        items: data.menus.map((menu) => ({ id: String(menu.WebMenuId), title: menu.MenuName, subtitle: menu.MenuLocation })),
        // The page's "Can Read" is the menu's Active flag.
        initial: Object.fromEntries(
          data.menus.map((menu) => [String(menu.WebMenuId), { Active: menu.MenuSelect, CanCreate: menu.CreateSelect, CanUpdate: menu.UpdateSelect, CanDelete: menu.DeleteSelect }]),
        ),
      } satisfies MatrixModel,
    }),
  });
  const save = useSave((values: Record<string, Flags>) => roleMenuApi.save(roleId, values), [accessKey('role-web-menus')], { fallback: 'Saved Role Information.' });

  return { roleId, setRoleId, query, save };
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
