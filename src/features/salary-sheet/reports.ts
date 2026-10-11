/** The 14 salary sheet reports, in the web entry page's button order. */
export type ReportSlug =
  | 'one-employee'
  | 'all-employee-detailed'
  | 'all-employee-segregated-tax'
  | 'cost-center-detailed'
  | 'cost-center-summary'
  | 'location-detailed'
  | 'location-summary'
  | 'division-detailed'
  | 'local-staff-detailed'
  | 'location-cost-center-summary'
  | 'expatriate-staff-detailed'
  | 'section-50'
  | 'vertical-cost-center-summary'
  | 'vertical-employee-report';

export interface ReportDefinition {
  slug: ReportSlug;
  title: string;
  /** Key of `reportAccess` in GET /admin/salary-reports. */
  access: string;
  /** Filter that must be chosen before the report can run (the server answers 422 otherwise). */
  requires?: 'employee_code' | 'location' | 'division';
}

export const REPORTS: ReportDefinition[] = [
  { slug: 'one-employee', title: 'Detailed Sheet-one Employee', access: 'salary_sheet_one_employee', requires: 'employee_code' },
  { slug: 'all-employee-detailed', title: 'All Employee Detailed', access: 'salary_sheet_all_employee_detailed' },
  { slug: 'all-employee-segregated-tax', title: 'All Employee Detailed Segregated Tax', access: 'salary_sheet_all_employee_segregated_tax' },
  { slug: 'cost-center-detailed', title: 'Cost Center wise-Detailed', access: 'salary_sheet_cost_center_detailed' },
  { slug: 'cost-center-summary', title: 'Cost Center Wise Summary', access: 'salary_sheet_cost_center_summary' },
  { slug: 'location-detailed', title: 'Location Wise Detailed', access: 'salary_sheet_location_detailed', requires: 'location' },
  { slug: 'location-summary', title: 'Location Wise Summary', access: 'salary_sheet_location_summary' },
  { slug: 'division-detailed', title: 'Division Wise-Detailed', access: 'salary_sheet_division_detailed', requires: 'division' },
  { slug: 'local-staff-detailed', title: 'Local Staff-Detailed', access: 'salary_sheet_local_staff_detailed' },
  { slug: 'location-cost-center-summary', title: 'Location and Costcenter summary', access: 'salary_sheet_location_cost_center_summary', requires: 'location' },
  { slug: 'expatriate-staff-detailed', title: 'Expatriate Staff-Detailed', access: 'salary_sheet_expatriate_staff_detailed' },
  { slug: 'section-50', title: 'Section 50 Report', access: 'salary_sheet_section_50' },
  { slug: 'vertical-cost-center-summary', title: 'Vertical Costcenter Summary', access: 'salary_sheet_vertical_cost_center_summary' },
  { slug: 'vertical-employee-report', title: 'Vertical Employee Report', access: 'salary_sheet_vertical_employee_report' },
];

export function reportBySlug(slug: string | undefined): ReportDefinition | undefined {
  return REPORTS.find((report) => report.slug === slug);
}
