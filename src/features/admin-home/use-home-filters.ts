import { useEffect, useMemo, useState } from 'react';

import type { BulkParams, HomeOptions, ReportScope } from './api';
import { REPORTS, type ReportDef } from './reports';

/** The Home form state: scope, picked employee / group value and the three period selects. */
export function useHomeFilters(options: HomeOptions | undefined) {
  const [scope, setScope] = useState<ReportScope>(1);
  const [employeeCode, setEmployeeCode] = useState('');
  const [groupValue, setGroupValue] = useState('');
  const [incomeYear, setIncomeYear] = useState('');
  const [month, setMonth] = useState('');
  const [pfYear, setPfYear] = useState('');

  useEffect(() => {
    if (!options) {
      return;
    }

    setIncomeYear((current) => current || options.incomeYears[0] || '');
    setPfYear((current) => current || options.pfYears[0] || '');
    setMonth((current) => current || (options.months[0] ? String(options.months[0].value) : ''));
  }, [options]);

  const changeScope = (next: ReportScope) => {
    setScope(next);
    setGroupValue('');
  };

  const groupOptions = useMemo(() => {
    if (!options) {
      return [];
    }

    if (scope === 3) {
      return options.departments.map((name) => ({ label: name, value: name }));
    }

    if (scope === 4) {
      return options.costCenters.map((center) => ({ label: center.text, value: String(center.value) }));
    }

    if (scope === 5) {
      return options.employeeCategories.map((name) => ({ label: name, value: name }));
    }

    return [];
  }, [options, scope]);

  const visibleReports: ReportDef[] = REPORTS.filter((report) => !options || options.visibleActions.length === 0 || options.visibleActions.includes(report.action));

  /** Route params the report screen receives; null when a required input is missing. */
  const paramsFor = (report: ReportDef): Record<string, string> | null => {
    if (scope === 1 && !employeeCode) {
      return null;
    }

    if (scope >= 3 && !groupValue) {
      return null;
    }

    if ((report.needs.includes('income_year') && !incomeYear) || (report.needs.includes('month') && !month) || (report.needs.includes('pf_year') && !pfYear)) {
      return null;
    }

    const params: Record<string, string> = { type: String(scope), value: groupValue };

    if (scope === 1) {
      params.employee_code = employeeCode;
    }

    if (report.needs.includes('income_year')) {
      params.income_year = incomeYear;
    }

    if (report.needs.includes('month')) {
      params.month = month;
    }

    if (report.needs.includes('pf_year')) {
      params.pf_year = pfYear;
    }

    return params;
  };

  return {
    scope,
    changeScope,
    employeeCode,
    setEmployeeCode,
    groupValue,
    setGroupValue,
    groupOptions,
    incomeYear,
    setIncomeYear,
    month,
    setMonth,
    pfYear,
    setPfYear,
    visibleReports,
    paramsFor,
  };
}

/** Rebuilds the bulk request from the route params of the report screen. */
export function toBulkParams(params: Record<string, string | undefined>): BulkParams {
  return {
    type: (Number(params.type) || 2) as ReportScope,
    value: params.value ?? '',
    income_year: params.income_year,
    month: params.month,
    pf_year: params.pf_year,
  };
}
