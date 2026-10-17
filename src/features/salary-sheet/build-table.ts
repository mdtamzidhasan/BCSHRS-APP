import type { Component, ReportResponse, SheetResponse, TotalsMap } from './api';
import { absMonthLabel, formatN, toNumber } from './format';

export interface TableColumn {
  key: string;
  label: string;
  width: number;
  align: 'left' | 'right' | 'center';
}

export interface TableRow {
  key: string;
  cells: string[];
  strong?: boolean;
}

export interface TableModel {
  columns: TableColumn[];
  rows: TableRow[];
  total: TableRow | null;
  /** A row of column numbers printed right under the head (Section 50). */
  numberRow?: string[];
}

function lookup(map: TotalsMap, key: string): number {
  return Array.isArray(map) ? 0 : toNumber(map[key]);
}

export function isSheetResponse(data: ReportResponse): data is SheetResponse {
  return 'employeeComponentTotals' in data && 'employees' in data && !('costcenters' in data) && !('branches' in data);
}

/** Web layout of the one-row-per-employee (or month) salary sheet: SL | identity | earnings | Sub-Total | deductions | Sub-Total | Net Payable. */
export function buildSheetTable(data: SheetResponse): TableModel {
  const byMonth = !!data.groupByMonth;
  const identity: TableColumn[] = [{ key: 'sl', label: 'SL', width: 40, align: 'center' }];

  if (byMonth) {
    identity.push({ key: 'month', label: 'Month', width: 120, align: 'left' });
  } else if (data.isCostCenterSummary) {
    identity.push({ key: 'name', label: 'Cost Center', width: 200, align: 'left' });
  } else {
    identity.push(
      { key: 'code', label: 'Code', width: 70, align: 'left' },
      { key: 'name', label: 'Employee Name', width: 160, align: 'left' },
      { key: 'desig', label: 'Designation', width: 130, align: 'left' },
    );
  }

  const amount = (label: string, key: string): TableColumn => ({ key, label, width: 90, align: 'right' });
  const columns: TableColumn[] = [
    ...identity,
    ...data.salaryComponents.map((c) => amount(c.name, `s:${c.name}`)),
    amount('Sub-Total', 'salary-total'),
    ...data.deductionComponents.map((c) => amount(c.name, `d:${c.name}`)),
    amount('Sub-Total', 'deduction-total'),
    amount('Net Payable', 'net'),
  ];

  const amounts = (read: (c: Component) => number): string[] => {
    const sum = (list: Component[]) => list.reduce((acc, c) => acc + read(c), 0);
    const earned = sum(data.salaryComponents);
    const deducted = sum(data.deductionComponents);

    return [
      ...data.salaryComponents.map((c) => formatN(read(c))),
      formatN(earned),
      ...data.deductionComponents.map((c) => formatN(read(c))),
      formatN(deducted),
      formatN(earned + deducted),
    ];
  };

  const entries = byMonth
    ? (data.months ?? []).map((month) => ({ key: String(month), identity: [absMonthLabel(month)] }))
    : data.employees.map((e) => ({
        key: e.code,
        identity: data.isCostCenterSummary ? [`${e.code} - ${e.ename}`] : [e.code, e.ename, e.desig ?? ''],
      }));

  const rows: TableRow[] = entries.map((entry, index) => ({
    key: entry.key,
    cells: [String(index + 1), ...entry.identity, ...amounts((c) => lookup(data.employeeComponentTotals, `k:${entry.key}-${c.category}-${c.name}`))],
  }));

  const labelCells = Array<string>(identity.length - 1).fill('');
  labelCells[labelCells.length - 1] = 'Grand Total';

  return {
    columns,
    rows,
    total: rows.length > 0 ? { key: 'total', strong: true, cells: ['', ...labelCells, ...amounts((c) => lookup(data.itemTotals, `k:${c.name}`))] } : null,
  };
}
