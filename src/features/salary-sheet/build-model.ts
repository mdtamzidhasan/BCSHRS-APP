import type {
  Component,
  CostCenterEmployeesResponse,
  LocationCostCenterResponse,
  ReportBanner,
  ReportResponse,
  Section50Response,
  SheetResponse,
  TotalsMap,
  VerticalResponse,
  VerticalRow,
} from './api';
import { absMonthLabel, formatN, monthLabel, toNumber } from './format';
import type { ReportSlug } from './reports';

export interface CardLine {
  name: string;
  value: string;
  /** A small prefix such as the vertical report's E / D type. */
  tag?: string;
}

export interface CardSection {
  title: string;
  lines: CardLine[];
}

export interface CardFact {
  label: string;
  value: string;
  strong?: boolean;
}

/** One card of the result: key figures plus an expandable breakdown. */
export interface ReportCardData {
  key: string;
  title: string;
  subtitle?: string;
  facts: CardFact[];
  sections: CardSection[];
}

export interface ReportGroup {
  key: string;
  title?: string;
  cards: ReportCardData[];
}

export interface ReportModel {
  banner: string[];
  groups: ReportGroup[];
  total: ReportCardData | null;
  isEmpty: boolean;
}

function lookup(map: TotalsMap, key: string): number {
  return Array.isArray(map) ? 0 : toNumber(map[key]);
}

function period(banner: ReportBanner): string | null {
  if (!banner.dateFrom) {
    return null;
  }

  return `Period: ${monthLabel(banner.dateFrom)}  To: ${monthLabel(banner.dateTo)}`;
}

function bannerLines(banner: ReportBanner): string[] {
  return [banner.companyName, banner.reportHeader, period(banner)].filter((line): line is string => !!line);
}

interface Breakdown {
  earnings: CardLine[];
  deductions: CardLine[];
  earningsTotal: number;
  deductionsTotal: number;
}

/** Non-zero components of a row; `read` returns the amount of one component. */
function breakdown(salary: Component[], deductions: Component[], read: (component: Component) => number): Breakdown {
  const collect = (components: Component[]) => {
    let total = 0;
    const lines: CardLine[] = [];

    for (const component of components) {
      const amount = read(component);
      total += amount;

      if (amount !== 0) {
        lines.push({ name: component.name, value: formatN(amount) });
      }
    }

    return { lines, total };
  };

  const earned = collect(salary);
  const deducted = collect(deductions);

  return { earnings: earned.lines, deductions: deducted.lines, earningsTotal: earned.total, deductionsTotal: deducted.total };
}

/** `deductionsPositive`: the cost-center / location viewers force amounts positive, so net = earnings - deductions. */
function breakdownCard(key: string, title: string, subtitle: string | undefined, parts: Breakdown, deductionsPositive: boolean): ReportCardData {
  const net = deductionsPositive ? parts.earningsTotal - parts.deductionsTotal : parts.earningsTotal + parts.deductionsTotal;

  return {
    key,
    title,
    subtitle,
    facts: [
      { label: 'Earnings', value: formatN(parts.earningsTotal) },
      { label: 'Deductions', value: formatN(parts.deductionsTotal) },
      { label: 'Net Payable', value: formatN(net), strong: true },
    ],
    sections: [
      { title: 'Earnings', lines: parts.earnings },
      { title: 'Deductions', lines: parts.deductions },
    ].filter((section) => section.lines.length > 0),
  };
}

function grandTotal(salary: Component[], deductions: Component[], itemTotals: TotalsMap, deductionsPositive: boolean): ReportCardData {
  return breakdownCard('total', 'Grand Total', undefined, breakdown(salary, deductions, (component) => lookup(itemTotals, `k:${component.name}`)), deductionsPositive);
}

function sheetModel(data: SheetResponse): ReportModel {
  const rowKeys = data.groupByMonth
    ? (data.months ?? []).map((month) => ({ key: String(month), title: absMonthLabel(month), subtitle: undefined as string | undefined }))
    : data.employees.map((employee) => ({
        key: employee.code,
        title: data.isCostCenterSummary ? `${employee.code} - ${employee.ename}` : employee.ename,
        subtitle: data.isCostCenterSummary ? undefined : `${employee.code}${employee.desig ? ` - ${employee.desig}` : ''}`,
      }));

  const cards = rowKeys.map((row) =>
    breakdownCard(
      row.key,
      row.title,
      row.subtitle,
      breakdown(data.salaryComponents, data.deductionComponents, (component) => lookup(data.employeeComponentTotals, `k:${row.key}-${component.category}-${component.name}`)),
      false,
    ),
  );

  return {
    banner: bannerLines(data),
    groups: [{ key: 'rows', cards }],
    total: cards.length > 0 ? grandTotal(data.salaryComponents, data.deductionComponents, data.itemTotals, false) : null,
    isEmpty: data.hasRecords === false || cards.length === 0,
  };
}

function costCenterEmployeesModel(data: CostCenterEmployeesResponse): ReportModel {
  const groups = data.costcenters.map((costcenter): ReportGroup => {
    const centerCard = breakdownCard(
      `cc-${costcenter.code}`,
      `${costcenter.name} - Total`,
      undefined,
      breakdown(data.salaryComponents, data.deductionComponents, (component) => lookup(data.costcenterComponentTotals, `k:${costcenter.code}-${component.category}-${component.name}`)),
      true,
    );

    const employeeCards = data.employees
      .filter((employee) => employee.costcenterCode === costcenter.code)
      .map((employee) =>
        breakdownCard(
          `${costcenter.code}-${employee.code}`,
          employee.ename,
          undefined,
          breakdown(data.salaryComponents, data.deductionComponents, (component) => lookup(data.costcenterEmployeeComponentTotals, `k:${costcenter.code}-${employee.code}-${component.category}-${component.name}`)),
          true,
        ),
      );

    return { key: costcenter.code, title: costcenter.name, cards: [...employeeCards, centerCard] };
  });

  return {
    banner: bannerLines(data),
    groups,
    total: groups.length > 0 ? grandTotal(data.salaryComponents, data.deductionComponents, data.itemTotals, true) : null,
    isEmpty: data.hasRecords === false || groups.length === 0,
  };
}

function locationCostCenterModel(data: LocationCostCenterResponse): ReportModel {
  const groups = data.branches.map((branch): ReportGroup => {
    const branchCard = breakdownCard(
      `br-${branch.code}`,
      `${branch.name} - Total`,
      undefined,
      breakdown(data.salaryComponents, data.deductionComponents, (component) => lookup(data.branchComponentTotals, `k:${branch.code}-${component.category}-${component.name}`)),
      true,
    );

    const centerCards = data.costcenters
      .filter((costcenter) => costcenter.branchCode === branch.code)
      .map((costcenter) =>
        breakdownCard(
          `${branch.code}-${costcenter.name}`,
          costcenter.name,
          undefined,
          breakdown(data.salaryComponents, data.deductionComponents, (component) => lookup(data.branchCostcenterComponentTotals, `k:${branch.code}-${costcenter.name}-${component.category}-${component.name}`)),
          true,
        ),
      );

    return { key: branch.code, title: branch.name, cards: [...centerCards, branchCard] };
  });

  return {
    banner: bannerLines(data),
    groups,
    total: groups.length > 0 ? grandTotal(data.salaryComponents, data.deductionComponents, data.itemTotals, true) : null,
    isEmpty: data.hasRecords === false || groups.length === 0,
  };
}

const SECTION_50_COLUMNS: [number, string][] = [
  [5, 'Basic Salary'],
  [6, 'Bonus, Arrear, Advance, Leave, Overtime'],
  [7, 'House Rent Allowance'],
  [8, 'Conveyance Allowance'],
  [9, 'Medical Allowance'],
  [10, 'Other Allowances'],
  [11, 'Non-cash Benefits: Accommodation'],
  [12, 'Non-cash Benefits: Conveyance'],
  [13, 'Non-cash Benefits: Other'],
  [14, "Employer's Contribution to RPF/GF/PF"],
  [15, 'Others (Non-perquisite)'],
];

function section50Model(data: Section50Response): ReportModel {
  // Legacy parity: the challan values are not reset between employees, so an employee without a challan shows the previous one.
  let challanNo = '';
  let challanDate = '';
  let bankName = '';
  let challanAmount = 0;

  const cards = data.employees.map((employee): ReportCardData => {
    const read = (column: number) => lookup(data.employeeColumnTotals, `k:${employee.code}-${column}`);
    const tax = read(17);
    const taxDeducted = tax < 1 ? tax * -1 : tax;
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
      title: employee.ename,
      subtitle: `${employee.code}${employee.desig ? ` - ${employee.desig}` : ''}${employee.tin ? ` | TIN ${employee.tin}` : ''}`,
      facts: [
        { label: 'Total', value: formatN(total) },
        { label: 'Tax deducted', value: formatN(taxDeducted), strong: true },
      ],
      sections: [
        { title: 'Income', lines: SECTION_50_COLUMNS.map(([column, name]) => ({ name, value: formatN(read(column)) })).filter((line) => line.value !== '0.00') },
        {
          title: 'Challan',
          lines: [
            { name: 'Challan No.', value: challanNo || '-' },
            { name: 'Challan Date', value: challanDate || '-' },
            { name: 'Bank Name', value: bankName || '-' },
            { name: 'Amount', value: formatN(challanAmount) },
            { name: 'Cumulative deduction this year', value: formatN(toNumber(employee.taxDeduction)) },
          ],
        },
      ].filter((section) => section.lines.length > 0),
    };
  });

  return {
    banner: [data.companyName, data.reportHeader, data.dateFrom ? `For the month of: ${monthLabel(data.dateFrom)}` : null].filter((line): line is string => !!line),
    groups: [{ key: 'rows', cards }],
    total: null,
    isEmpty: data.hasRecords === false || cards.length === 0,
  };
}

function verticalModel(slug: ReportSlug, data: VerticalResponse): ReportModel {
  const byCostCenter = slug === 'vertical-cost-center-summary';
  const buckets = new Map<string, { title: string; subtitle?: string; rows: VerticalRow[] }>();

  for (const row of data.rows) {
    const key = byCostCenter ? String(row.costcenter_code ?? '') : String(row.emp_code ?? '');

    if (!buckets.has(key)) {
      buckets.set(
        key,
        byCostCenter
          ? { title: String(row.costcenter ?? key), subtitle: key, rows: [] }
          : { title: String(row.ename ?? key), subtitle: `${key}${row.desig ? ` - ${row.desig}` : ''}`, rows: [] },
      );
    }

    buckets.get(key)?.rows.push(row);
  }

  const cards = [...buckets.entries()].map(([key, bucket]): ReportCardData => {
    const total = bucket.rows.reduce((sum, row) => sum + toNumber(row.amt), 0);

    return {
      key,
      title: bucket.title,
      subtitle: bucket.subtitle,
      facts: [
        { label: 'Items', value: String(bucket.rows.length) },
        { label: 'Total', value: formatN(total), strong: true },
      ],
      sections: [
        {
          title: 'Items',
          lines: bucket.rows.map((row) => ({
            name: row.item,
            value: formatN(toNumber(row.amt)),
            tag: byCostCenter ? (row.cat === '1. Salary' ? 'E' : 'D') : undefined,
          })),
        },
      ],
    };
  });

  return {
    banner: [data.companyName, data.period].filter((line): line is string => !!line),
    groups: [{ key: 'rows', cards }],
    total: null,
    isEmpty: cards.length === 0,
  };
}

/** Turns the answer of any of the 14 reports into the card model the result screen renders. */
export function buildReportModel(slug: ReportSlug, data: ReportResponse): ReportModel {
  if (slug === 'section-50') {
    return section50Model(data as Section50Response);
  }

  if (slug === 'vertical-cost-center-summary' || (slug === 'vertical-employee-report' && 'rows' in data)) {
    return verticalModel(slug, data as VerticalResponse);
  }

  if ('branches' in data) {
    return locationCostCenterModel(data);
  }

  if ('costcenters' in data && 'costcenterEmployeeComponentTotals' in data) {
    return costCenterEmployeesModel(data);
  }

  return sheetModel(data as SheetResponse);
}
