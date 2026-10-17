import type { Component, CostCenterEmployeesResponse, LocationCostCenterResponse, ReportResponse, Section50Response, TotalsMap, VerticalResponse } from './api';
import { SECTION_50_COLUMNS } from './build-model';
import { buildSheetTable, isSheetResponse, type TableColumn, type TableModel, type TableRow } from './build-table';
import { formatN, toNumber } from './format';

function lookup(map: TotalsMap, key: string): number {
  return Array.isArray(map) ? 0 : toNumber(map[key]);
}

const amountColumn = (label: string, key: string): TableColumn => ({ key, label, width: 90, align: 'right' });

interface Group {
  key: string;
  label: string;
  totals: TotalsMap;
  prefix: string;
  members: { key: string; label: string; totals: TotalsMap; prefix: string }[];
}

/** Cost Center wise-Detailed and Location and Costcenter summary: bold group row, its member rows, then a Total row (amounts are already positive, so net = earnings - deductions). */
function groupedTable(data: CostCenterEmployeesResponse | LocationCostCenterResponse, groups: Group[]): TableModel {
  const { salaryComponents, deductionComponents } = data;
  const columns: TableColumn[] = [
    { key: 'name', label: '', width: 220, align: 'left' },
    ...salaryComponents.map((c) => amountColumn(c.name, `s:${c.name}`)),
    amountColumn('Sub-Total', 'salary-total'),
    ...deductionComponents.map((c) => amountColumn(c.name, `d:${c.name}`)),
    amountColumn('Sub-Total', 'deduction-total'),
    amountColumn('Net Payable', 'net'),
  ];

  const cells = (label: string, read: (c: Component) => number): string[] => {
    const earned = salaryComponents.reduce((acc, c) => acc + read(c), 0);
    const deducted = deductionComponents.reduce((acc, c) => acc + read(c), 0);

    return [label, ...salaryComponents.map((c) => formatN(read(c))), formatN(earned), ...deductionComponents.map((c) => formatN(read(c))), formatN(deducted), formatN(earned - deducted)];
  };

  const rows: TableRow[] = [];

  for (const group of groups) {
    rows.push({ key: group.key, strong: true, cells: cells(group.label, (c) => lookup(group.totals, `k:${group.prefix}-${c.category}-${c.name}`)) });

    for (const member of group.members) {
      rows.push({ key: `${group.key}-${member.key}`, cells: cells(member.label, (c) => lookup(member.totals, `k:${member.prefix}-${c.category}-${c.name}`)) });
    }
  }

  // Legacy: the Total row's component cells are the item totals (deductions absolute); its sums add up the group rows.
  const groupSum = (components: Component[]) =>
    groups.reduce((acc, g) => acc + components.reduce((sum, c) => sum + lookup(g.totals, `k:${g.prefix}-${c.category}-${c.name}`), 0), 0);
  const earnedTotal = groupSum(salaryComponents);
  const deductedTotal = groupSum(deductionComponents);

  return {
    columns,
    rows,
    total:
      groups.length > 0
        ? {
            key: 'total',
            strong: true,
            cells: [
              'Total',
              ...salaryComponents.map((c) => formatN(lookup(data.itemTotals, `k:${c.name}`))),
              formatN(earnedTotal),
              ...deductionComponents.map((c) => formatN(Math.abs(lookup(data.itemTotals, `k:${c.name}`)))),
              formatN(deductedTotal),
              formatN(earnedTotal - deductedTotal),
            ],
          }
        : null,
  };
}

function costCenterEmployeesTable(data: CostCenterEmployeesResponse): TableModel {
  return groupedTable(
    data,
    data.costcenters.map((cc) => ({
      key: cc.code,
      label: cc.name,
      totals: data.costcenterComponentTotals,
      prefix: cc.code,
      members: data.employees
        .filter((e) => e.costcenterCode === cc.code)
        .map((e) => ({ key: e.code, label: e.ename, totals: data.costcenterEmployeeComponentTotals, prefix: `${cc.code}-${e.code}` })),
    })),
  );
}

function locationCostCenterTable(data: LocationCostCenterResponse): TableModel {
  return groupedTable(
    data,
    data.branches.map((branch) => ({
      key: branch.code,
      label: `${branch.code}-${branch.name}`,
      totals: data.branchComponentTotals,
      prefix: branch.code,
      members: data.costcenters
        .filter((cc) => cc.branchCode === branch.code)
        .map((cc) => ({ key: cc.name, label: cc.name, totals: data.branchCostcenterComponentTotals, prefix: `${branch.code}-${cc.name}` })),
    })),
  );
}

function section50Table(data: Section50Response): TableModel {
  const columns: TableColumn[] = [
    { key: 'code', label: 'Code', width: 70, align: 'left' },
    { key: 'name', label: 'Name of Emplyee', width: 160, align: 'left' },
    { key: 'desig', label: 'Designation', width: 130, align: 'left' },
    { key: 'tin', label: 'Tin', width: 110, align: 'left' },
    ...SECTION_50_COLUMNS.map(([column, label]) => ({ key: `c${column}`, label, width: 110, align: 'right' as const })),
    amountColumn('Total', 'total'),
    amountColumn('Amount of tax deduct', 'tax'),
    { key: 'challan-no', label: 'Challan No.', width: 90, align: 'left' },
    { key: 'challan-date', label: 'Challan Date', width: 90, align: 'left' },
    { key: 'bank', label: 'Bank Name', width: 120, align: 'left' },
    amountColumn('Amount', 'challan-amount'),
    { key: 'cumulative', label: 'Cumulative deduction in this month of current year', width: 130, align: 'right' },
    { key: 'remarks', label: 'Remarks', width: 80, align: 'left' },
  ];

  // Legacy parity: the challan values are not reset between employees.
  let challanNo = '';
  let challanDate = '';
  let bankName = '';
  let challanAmount = 0;

  const rows = data.employees.map((employee): TableRow => {
    const read = (column: number) => lookup(data.employeeColumnTotals, `k:${employee.code}-${column}`);
    const tax = read(17);
    const total = SECTION_50_COLUMNS.reduce((sum, [column]) => sum + read(column), 0);
    const challan = data.taxChallans.find((row) => String(row.emp_code) === employee.code);

    if (challan) {
      challanNo = String(challan.challan_no);
      const date = new Date(challan.challan_date);
      challanDate = Number.isNaN(date.getTime()) ? String(challan.challan_date) : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      bankName = String(challan.bank);
      challanAmount = toNumber(challan.total_amt);
    }

    return {
      key: employee.code,
      cells: [
        employee.code,
        employee.ename,
        employee.desig ?? '',
        employee.tin ?? '',
        ...SECTION_50_COLUMNS.map(([column]) => formatN(read(column))),
        formatN(total),
        formatN(tax < 1 ? tax * -1 : tax),
        challanNo,
        challanDate,
        bankName,
        formatN(challanAmount),
        formatN(toNumber(employee.taxDeduction)),
        '',
      ],
    };
  });

  return { columns, rows, total: null, numberRow: columns.map((_, index) => String(index + 1)) };
}

/** Vertical Costcenter Summary / Vertical Employee Report: one row per SP row, amount printed as is. */
function verticalTable(slug: string, data: VerticalResponse): TableModel {
  const byCostCenter = slug === 'vertical-cost-center-summary';
  const columns: TableColumn[] = byCostCenter
    ? [
        { key: 'code', label: 'Code', width: 70, align: 'left' },
        { key: 'name', label: 'Name', width: 160, align: 'left' },
        { key: 'item', label: 'Item Name', width: 180, align: 'left' },
        { key: 'sub', label: 'Sub Code', width: 260, align: 'left' },
        amountColumn('Amount', 'amt'),
        { key: 'type', label: 'Type', width: 40, align: 'center' },
      ]
    : [
        { key: 'code', label: 'Code', width: 70, align: 'left' },
        { key: 'name', label: 'Name', width: 160, align: 'left' },
        { key: 'desig', label: 'Designation', width: 130, align: 'left' },
        { key: 'item', label: 'Item Name', width: 180, align: 'left' },
        amountColumn('Amount', 'amt'),
      ];

  const rows = data.rows.map((row, index): TableRow => {
    if (!byCostCenter) {
      return { key: String(index), cells: [row.emp_code ?? '', row.ename ?? '', row.desig ?? '', row.item, String(row.amt)] };
    }

    const earning = row.cat === '1. Salary';
    const sub = earning ? `161-0000000-${row.s_code ?? ''}-${row.sub_code ?? ''}-00-000-000-0000-00000` : '-';

    return { key: String(index), cells: [row.costcenter_code ?? '', row.costcenter ?? '', row.item, sub, String(row.amt), earning ? 'E' : 'D'] };
  });

  return { columns, rows, total: null };
}

/** The web-style table of any of the 14 reports, or null when the answer has no table shape. */
export function buildTable(slug: string, data: ReportResponse): TableModel | null {
  if (slug === 'section-50') {
    return section50Table(data as Section50Response);
  }

  if (slug === 'vertical-cost-center-summary' || (slug === 'vertical-employee-report' && 'rows' in data)) {
    return verticalTable(slug, data as VerticalResponse);
  }

  if ('branches' in data) {
    return locationCostCenterTable(data);
  }

  if ('costcenters' in data && 'costcenterEmployeeComponentTotals' in data) {
    return costCenterEmployeesTable(data);
  }

  return isSheetResponse(data) ? buildSheetTable(data) : null;
}
