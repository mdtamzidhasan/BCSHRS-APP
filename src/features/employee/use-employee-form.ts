import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';
import { useFormErrors } from '@/hooks/use-form-errors';

import { employeeApi, formLookups, type EmployeeRecord } from './api';
import { employeeKeys } from './use-employees';

const SLOTS = ['', '2', '3'] as const;
export type BankSlot = (typeof SLOTS)[number];

const BASE_KEYS = [
  'code', 'ename', 'gender', 'birth_date', 'marital_status', 'religion', 'nationality', 'bangladeshi', 'father', 'mother', 'spouse', 'spouse_occup',
  'addr', 'addr_perm', 'nominee_name', 'nominee_relation', 'ws_type', 'job_placement', 'desig', 'job_code', 'dept', 'location', 'ws_code',
  'emp_cat', 'job_status', 'grade_cat', 'grade', 'grade_step', 'costcenter_code', 'costcenter', 'join_date', 'confirm_date', 'pf_date',
  'separation_date', 'currency', 'process_salary', 'finally_settled', 'sal_brkdn_compliant', 'clearance_taken', 'circle', 'zone_city', 'tin',
  'status', 'res_status', 'employer', 'tel_off', 'tel_res', 'email', 'web', 'insurance_policy', 'plan_class', 'place_birth', 'height', 'weight',
  'blood_gr', 'passport', 'national_id', 'highest_degree', 'cnt_children', 'rmk',
];
const BANK_KEYS = SLOTS.flatMap((slot) => [`bank_name${slot}`, `bank_branch${slot}`, `bank_acc${slot}`, `pct${slot}`, `company_br${slot}`, `company_acc${slot}`]);
const FIELD_KEYS = [...BASE_KEYS, ...BANK_KEYS];
const DATE_KEYS = ['birth_date', 'join_date', 'confirm_date', 'pf_date', 'separation_date'];
const NUMBER_KEYS = ['pct', 'pct2', 'pct3', 'cnt_children'];

export const PLACEMENT_TYPES = ['Dept', 'Company', 'Division', 'Branch', 'Project'];
export const JOB_STATUSES = ['Active', 'Resigned', 'Not in Job', 'Terminated'];
export const GRADES = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
export const GRADE_STEPS = Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, '0'));
export const CURRENCIES = ['BDT', 'USD', 'INR'];
export const YES_NO = ['YES', 'NO'];
export const TAX_STATUSES = ['Individual', 'Association of Person', 'HUF', 'Artificial Juridical Person'];
export const RESIDENTIAL_STATUSES = ['Resident', 'Non-Resident'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type Values = Record<string, string>;

function toValues(record?: EmployeeRecord): Values {
  const values: Values = {};

  for (const key of FIELD_KEYS) {
    const raw = record?.[key];
    const text = raw === null || raw === undefined ? '' : String(raw);
    values[key] = DATE_KEYS.includes(key) ? text.slice(0, 10) : text;
  }

  // The web form falls back to the workspace name for the job placement.
  if (!values.job_placement && record?.ws_name) {
    values.job_placement = String(record.ws_name);
  }

  return values;
}

/** Keeps the stored value selectable even when the lookup list does not contain it. */
export function withCurrent(list: string[] | undefined, current: string): { label: string; value: string }[] {
  const items = [...(list ?? [])];

  if (current && !items.includes(current)) {
    items.push(current);
  }

  return items.map((item) => ({ label: item, value: item }));
}

export function useEmployeeRecord(code: string) {
  return useQuery({ queryKey: employeeKeys.detail(code), queryFn: () => employeeApi.get(code) });
}

function useLookup(key: string, fn: () => Promise<string[]>) {
  return useQuery({ queryKey: ['admin', 'employee', 'lookup', key], queryFn: fn });
}

/** The cascading bank -> branch -> account lookups of one of the three payment slots. */
function useBankSlot(values: Values, slot: BankSlot) {
  const bank = values[`bank_name${slot}`];
  const companyBranch = values[`company_br${slot}`];

  const employeeBranches = useQuery({ queryKey: ['admin', 'employee', 'lookup', 'employee-branches', bank], queryFn: () => formLookups.employeeBranches(bank), enabled: !!bank });
  const companyBranches = useQuery({ queryKey: ['admin', 'employee', 'lookup', 'company-branches', bank], queryFn: () => formLookups.companyBranches(bank), enabled: !!bank });
  const accounts = useQuery({ queryKey: ['admin', 'employee', 'lookup', 'accounts', bank, companyBranch], queryFn: () => formLookups.companyAccounts(bank, companyBranch), enabled: !!bank });

  return {
    employeeBranches: withCurrent(employeeBranches.data, values[`bank_branch${slot}`]),
    companyBranches: withCurrent(companyBranches.data, companyBranch),
    accounts: withCurrent(accounts.data, values[`company_acc${slot}`]),
  };
}

/** Form state, the cascading dropdowns and the save of the Add / Edit Employee screen. */
export function useEmployeeForm(initial: EmployeeRecord | undefined, onSaved: () => void) {
  const queryClient = useQueryClient();
  const isEdit = !!initial;
  const [values, setValues] = useState<Values>(() => toValues(initial));
  // LEGACY: Web Access / Web Password are commented out of EntryEmployeeBasicInfo.aspx; neither is sent, the server keeps the stored values.
  // const [webAccess, setWebAccess] = useState(!!initial?.web_access);
  const [chequePay, setChequePay] = useState(!!initial?.cheque_pay);

  const empCategories = useLookup('emp-categories', formLookups.empCategories);
  const gradeCategories = useLookup('grade-categories', formLookups.gradeCategories);
  const salaryCircles = useLookup('salary-circles', formLookups.salaryCircles);
  const taxZones = useLookup('tax-zones', formLookups.taxZones);
  const companyBanks = useLookup('company-banks', formLookups.companyBanks);

  const wsType = values.ws_type;
  const placement = values.job_placement;
  const jobSpaces = useQuery({ queryKey: ['admin', 'employee', 'lookup', 'job-spaces', wsType], queryFn: () => formLookups.jobSpaces(wsType), enabled: !!wsType });
  const designations = useQuery({
    queryKey: ['admin', 'employee', 'lookup', 'designations', wsType, placement],
    queryFn: () => formLookups.designations(wsType, placement),
    enabled: !!wsType && !!placement,
  });

  const slots = [useBankSlot(values, ''), useBankSlot(values, '2'), useBankSlot(values, '3')];

  const [lookupBusy, setLookupBusy] = useState(false);

  const patch = (changes: Values) => setValues((current) => ({ ...current, ...changes }));

  const change = (key: string, value: string) => {
    if (key === 'ws_type') {
      patch({ ws_type: value, job_placement: '', desig: '', dept: '' });
    } else if (key === 'job_placement') {
      patch({ job_placement: value, desig: '', dept: (value.split('>').pop() ?? '').trim() });
    } else if (key === 'desig') {
      patch({ desig: value });
      void applyDesignation(value);
    } else if (key.startsWith('bank_name')) {
      const slot = key.slice('bank_name'.length);
      patch({ [key]: value, [`bank_branch${slot}`]: '', [`company_br${slot}`]: '', [`company_acc${slot}`]: '' });
    } else if (key.startsWith('company_br')) {
      const slot = key.slice('company_br'.length);
      patch({ [key]: value, [`company_acc${slot}`]: '' });
    } else {
      patch({ [key]: value });
    }
  };

  // The location and the cost center follow the designation.
  const applyDesignation = async (designation: string) => {
    setLookupBusy(true);

    try {
      const [location, cost] = await Promise.all([formLookups.location(designation), formLookups.costCenter(designation)]);
      patch({ location: location ?? '', costcenter_code: cost.code ?? '', costcenter: cost.name ?? '' });
    } catch {
      toast.error('Could not load the location and cost center for this designation.');
    } finally {
      setLookupBusy(false);
    }
  };

  const mutation = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {};

      for (const key of FIELD_KEYS) {
        const text = values[key].trim();
        body[key] = NUMBER_KEYS.includes(key) ? (text === '' ? null : Number(text)) : text === '' ? null : values[key];
      }

      // body.web_access = webAccess;
      body.cheque_pay = chequePay;

      return employeeApi.save(body);
    },
    onSuccess: async (message) => {
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      onSaved();
    },
  });

  const errors = useFormErrors(mutation.error);

  return {
    isEdit,
    values,
    errors,
    mutation,
    lookupBusy,
    // webAccess,
    // setWebAccess,
    chequePay,
    setChequePay,
    /** Props for a TextField. */
    input: (key: string) => ({ value: values[key], onChangeText: (text: string) => change(key, text), error: errors.field(key) }),
    /** Props for a SelectField (options include the stored value). */
    select: (key: string, list: string[] | undefined) => ({ value: values[key] || null, options: withCurrent(list, values[key]), onChange: (value: string) => change(key, value), error: errors.field(key) }),
    selectWith: (key: string, options: { label: string; value: string }[]) => ({ value: values[key] || null, options, onChange: (value: string) => change(key, value), error: errors.field(key) }),
    lists: {
      empCategories: empCategories.data,
      gradeCategories: gradeCategories.data,
      salaryCircles: salaryCircles.data,
      taxZones: taxZones.data,
      banks: companyBanks.data,
      jobSpaces: jobSpaces.data,
      designations: designations.data,
    },
    slots,
    submit: () => mutation.mutate(),
  };
}

export type EmployeeFormApi = ReturnType<typeof useEmployeeForm>;
export { SLOTS };
