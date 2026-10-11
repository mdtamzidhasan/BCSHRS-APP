import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { toast } from '@/components/ui/toast';

import { jobInfoApi, type JobDeduction, type JobEarning, type JobEmployee } from './api';

const key = (...parts: unknown[]) => ['admin', 'job-info', ...parts] as const;

export const POSITION_TYPES = ['Transfer', 'Promotion'];
export const PLACEMENT_LEVELS = ['Company', 'Division', 'Branch', 'Dept', 'Project'];
export const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
export const GRADE_STEPS = Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, '0'));

/** LEGACY: jobInfo.js DEDUCTION_ROWS — [name, TT_EMP column]. */
const DEDUCTION_ROWS: [string, string][] = [
  ['Tax', 'ded_tax'], ['LoanGeneral', 'ded_loan_gen'], ['LoanPF', 'ded_loan_PF'], ['Advance', 'ded_adv'], ['PF', 'ded_PF'],
  ['Penalty', 'ded_penalty'], ['Absence', 'ded_absence'], ['Lunch', 'ded_lunch'], ['Transport', 'ded_transport'], ['Insurance', 'ded_insurance'],
  ...Array.from({ length: 15 }, (_, i): [string, string] => [String(i + 1), `ded_${i + 1}`]),
  ['Others', 'ded_oths'],
];

const intOf = (value: string): number => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function useJobInfo() {
  const queryClient = useQueryClient();

  const access = useQuery({ queryKey: key('access'), queryFn: jobInfoApi.access });
  const employees = useQuery({ queryKey: key('employees'), queryFn: jobInfoApi.employees, enabled: false });

  const [employee, setEmployee] = useState<JobEmployee | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [position, setPosition] = useState({ actType: '', wsType: '', wsName: '', desig: '', gradeCategory: '', grade: '', gradeStep: '', actDate: '', effDate: '', remarks: '' });
  const patch = (changes: Partial<typeof position>) => setPosition((current) => ({ ...current, ...changes }));

  const [grossSal, setGrossSal] = useState('');
  const [earnings, setEarnings] = useState<JobEarning[] | null>(null);
  const [deduction, setDeduction] = useState<JobDeduction | null>(null);

  const gradeCategories = useQuery({ queryKey: key('grade-categories'), queryFn: jobInfoApi.gradeCategories, enabled: showNew });
  const jobSpaces = useQuery({ queryKey: key('job-spaces', position.wsType), queryFn: () => jobInfoApi.jobSpaces(position.wsType), enabled: showNew && !!position.wsType });

  // LEGACY: the first job space / designation / grade category is selected automatically.
  const wsName = position.wsName || jobSpaces.data?.[0] || '';
  const designations = useQuery({
    queryKey: key('designations', position.wsType, wsName),
    queryFn: () => jobInfoApi.designations(position.wsType, wsName),
    enabled: showNew && !!position.wsType && !!wsName,
  });
  const desig = position.desig || designations.data?.[0] || '';
  const gradeCategory = position.gradeCategory || gradeCategories.data?.[0] || '';

  const reset = () => {
    setEmployee(null);
    setShowNew(false);
    setPosition({ actType: '', wsType: '', wsName: '', desig: '', gradeCategory: '', grade: '', gradeStep: '', actDate: '', effDate: '', remarks: '' });
    setGrossSal('');
    setEarnings(null);
    setDeduction(null);
  };

  const pick = (picked: JobEmployee) => {
    setEmployee(picked);
    setGrossSal(String(picked.GrossSalary ?? ''));
    setEarnings(null);
    setDeduction(null);
  };

  const toggleNewPosition = (on: boolean) => {
    setShowNew(on);
    setPosition(on ? { actType: 'Transfer', wsType: 'Dept', wsName: '', desig: '', gradeCategory: '', grade: '01', gradeStep: '01', actDate: '', effDate: '', remarks: '' } : { actType: '', wsType: '', wsName: '', desig: '', gradeCategory: '', grade: '', gradeStep: '', actDate: '', effDate: '', remarks: '' });
  };

  const setPlacementLevel = (wsType: string) => patch({ wsType, wsName: '', desig: '' });
  const setPlacement = (name: string) => patch({ wsName: name, desig: '' });

  const loadEarnings = useMutation({ mutationFn: (code: string) => jobInfoApi.earnings(code), onSuccess: setEarnings });
  const loadDeduction = useMutation({ mutationFn: (code: string) => jobInfoApi.deduction(code), onSuccess: setDeduction });

  const toggleEarnings = (on: boolean) => {
    if (!on) {
      setEarnings(null);
    } else if (!employee) {
      toast.error('Select employee.');
    } else {
      loadEarnings.mutate(employee.EmployeeCode);
    }
  };

  const toggleDeduction = (on: boolean) => {
    if (!on) {
      setDeduction(null);
    } else if (!employee) {
      toast.error('Select employee.');
    } else {
      loadDeduction.mutate(employee.EmployeeCode);
    }
  };

  const editEarning = (index: number, field: 'CashAmount' | 'NonCash' | 'NonCashAmount' | 'Remarks', value: string) =>
    setEarnings((current) => (current ? current.map((row, i) => (i === index ? { ...row, [field]: value } : row)) : current));

  const editDeduction = (column: string, value: string) => setDeduction((current) => (current ? { ...current, [column]: value } : current));

  const totals = useMemo(() => {
    let total = 0;
    let monthly = 0;

    for (const row of earnings ?? []) {
      total += intOf(row.CashAmount);

      if (row.Monthly) {
        monthly += intOf(row.CashAmount);
      }
    }

    return { total, monthly, difference: intOf(grossSal) - monthly };
  }, [earnings, grossSal]);

  const deductionRows = useMemo(
    () =>
      deduction
        ? DEDUCTION_ROWS.filter(([name]) => deduction[`OptionDeduction${name}`] === true).map(([name, column]) => ({
            column,
            caption: String(deduction[`Deduction${name}`] ?? name),
            value: String(deduction[column] ?? ''),
          }))
        : [],
    [deduction],
  );

  const save = useMutation({
    mutationFn: () =>
      jobInfoApi.save({
        AddTransfer: showNew,
        Transfer: {
          EmpCode: employee?.EmployeeCode ?? '',
          Desig: desig,
          Dept: employee?.Dept ?? '',
          WsName: wsName,
          Grade: position.grade,
          WsType: position.wsType,
          GradeCategory: gradeCategory,
          GradeStep: position.gradeStep,
          ActType: position.actType,
          Rmk: position.remarks,
          ActDate: position.actDate,
          EffDate: position.effDate,
        },
        AddEarning: earnings !== null,
        Earnings: earnings,
        AddDeduction: deduction !== null,
        Deduction: deduction,
      }),
    onSuccess: async () => {
      toast.success('Saved Employee Information.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'job-info'] });
      reset();
    },
  });

  const submit = () => {
    if (!employee) {
      toast.error('Select employee.');
      return;
    }

    if (earnings !== null && totals.difference !== 0) {
      toast.error('Gross salary does not match.');
      return;
    }

    save.mutate();
  };

  return {
    access,
    employees,
    loadEmployees: () => {
      if (!employees.data && !employees.isFetching) {
        void employees.refetch();
      }
    },
    employee,
    pick,
    reset,
    showNew,
    toggleNewPosition,
    position: { ...position, wsName, desig, gradeCategory },
    patch,
    setPlacementLevel,
    setPlacement,
    jobSpaces: jobSpaces.data ?? [],
    designations: designations.data ?? [],
    gradeCategories: gradeCategories.data ?? [],
    grossSal,
    setGrossSal,
    earnings,
    loadingEarnings: loadEarnings.isPending,
    earningsError: loadEarnings.error,
    toggleEarnings,
    editEarning,
    totals,
    deduction,
    deductionRows,
    loadingDeduction: loadDeduction.isPending,
    deductionError: loadDeduction.error,
    toggleDeduction,
    editDeduction,
    save,
    submit,
  };
}

export type JobInfoApi = ReturnType<typeof useJobInfo>;
