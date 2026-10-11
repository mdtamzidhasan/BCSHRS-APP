import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { fetchEmployeeList, fetchSalaryEntry, searchEmployee, type EmployeeBrief, type ReportParams } from './api';
import { REPORTS, type ReportDefinition } from './reports';

export interface SalaryFilters {
  incomeYear: string;
  dateFrom: string;
  dateTo: string;
  empCat: string;
  costCenter: string;
  location: string;
  division: string;
  currency: string;
  employeeCode: string;
  sortOrder: boolean;
  groupItem: boolean;
}

const EMPTY: SalaryFilters = {
  incomeYear: '',
  dateFrom: '',
  dateTo: '',
  empCat: '',
  costCenter: '',
  location: '',
  division: '',
  currency: 'BDT',
  employeeCode: '',
  sortOrder: false,
  groupItem: false,
};

/** The entry screen: lookups from GET /admin/salary-reports, the filter form and the report buttons the role may use. */
export function useSalaryEntry() {
  const query = useQuery({ queryKey: ['admin', 'salary-sheet', 'entry'], queryFn: fetchSalaryEntry });
  const [edits, setEdits] = useState<Partial<SalaryFilters>>({});
  const [employee, setEmployee] = useState<EmployeeBrief | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState<Record<string, string>>({});
  const data = query.data;

  // The web form has no blank item for these: the first value is always selected until the user chooses.
  const defaults = useMemo<SalaryFilters>(
    () => ({
      ...EMPTY,
      incomeYear: data?.incomeYears[0] ?? '',
      dateFrom: data?.defaultPeriod ?? '',
      dateTo: data?.defaultPeriod ?? '',
      empCat: data?.employeeCategories[0] ?? '',
      location: data?.locations[0]?.branch_code ?? '',
      division: data?.divisions[0]?.div_code ?? '',
      currency: data?.currencies.includes('BDT') || !data?.currencies[0] ? 'BDT' : data.currencies[0],
    }),
    [data],
  );

  const filters: SalaryFilters = { ...defaults, ...edits };

  const set = <K extends keyof SalaryFilters>(key: K, value: SalaryFilters[K]) => {
    setEdits((current) => ({ ...current, [key]: value }));
    setMissing((current) => ({ ...current, [key]: '' }));
  };

  const lookup = useMutation({
    mutationFn: (code: string) => searchEmployee(code),
    onSuccess: (found) => {
      setEmployee(found);
      setLookupMessage(found ? null : 'Employee not found.');
    },
    onError: () => setLookupMessage('Could not look up the employee.'),
  });

  const lookupEmployee = () => {
    const code = filters.employeeCode.trim();

    if (code) {
      lookup.mutate(code);
    } else {
      setEmployee(null);
      setLookupMessage(null);
    }
  };

  const chooseEmployee = (picked: EmployeeBrief) => {
    set('employeeCode', picked.code);
    setEmployee(picked);
    setLookupMessage(null);
  };

  const visibleReports = useMemo(() => REPORTS.filter((report) => data?.reportAccess[report.access] === true), [data]);

  /** Query-string parameters of a report run, or null (and field messages) when a required filter is missing. */
  const paramsFor = (report: ReportDefinition): ReportParams | null => {
    const problems: Record<string, string> = {};

    if (!filters.dateFrom || !filters.dateTo) {
      problems.dateFrom = 'Choose the period.';
    } else if (filters.dateTo < filters.dateFrom) {
      problems.dateTo = 'The end month must not be before the start month.';
    }

    if (report.requires === 'employee_code' && !filters.employeeCode.trim()) {
      problems.employeeCode = 'Enter the employee code.';
    }

    if (report.requires === 'location' && !filters.location) {
      problems.location = 'Please select a location.';
    }

    if (report.requires === 'division' && !filters.division) {
      problems.division = 'Please select a division.';
    }

    setMissing(problems);

    if (Object.keys(problems).length > 0) {
      return null;
    }

    const params: ReportParams = {
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      income_year: filters.incomeYear,
      emp_cat: filters.empCat,
      cost_center: filters.costCenter,
      location: filters.location,
      division: filters.division,
      currency: filters.currency || 'BDT',
      employee_code: filters.employeeCode.trim(),
    };

    if (filters.sortOrder) {
      params.sort_order = '1';
    }

    if (filters.groupItem) {
      params.group_item = '1';
    }

    return params;
  };

  return { query, data, filters, set, missing, employee, lookupMessage, lookingUp: lookup.isPending, lookupEmployee, chooseEmployee, visibleReports, paramsFor };
}

/** The "Add Employee" modal: a debounced search over GET /admin/salary-reports/employees with paging. */
export function useEmployeePicker(enabled: boolean) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ['admin', 'salary-sheet', 'employees', term, page],
    queryFn: () => fetchEmployeeList(term, page),
    enabled,
    placeholderData: keepPreviousData,
  });

  return { search, setSearch, page, setPage, query };
}
