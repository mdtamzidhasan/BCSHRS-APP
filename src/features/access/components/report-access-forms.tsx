import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SwitchRow } from '@/components/ui/misc';
import { RadioGroup } from '@/components/ui/radio-group';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';

import { MonthPicker } from '@/features/payroll/components/month-picker';
import { monthValue } from '@/features/payroll/month';

import { REPORT_ACCESS_FLAGS, type Flags, type MonthlyAccess } from '../api';
import { useMonthlyAccess, usePayrollAccess } from '../use-matrix';

/** Payroll Report Access: one switch per member-facing report of the company. */
export function PayrollAccessForm({ initial }: { initial: Flags }) {
  const [flags, setFlags] = useState<Flags>(initial);
  const { save } = usePayrollAccess();

  return (
    <>
      <Card>
        {REPORT_ACCESS_FLAGS.map((flag) => (
          <SwitchRow key={flag.id} label={flag.label} value={!!flags[flag.id]} onChange={(value) => setFlags((current) => ({ ...current, [flag.id]: value }))} />
        ))}
      </Card>
      <FormError error={save.error} />
      <Button title="Save" icon="save-outline" loading={save.isPending} onPress={() => save.mutate(flags)} />
    </>
  );
}

/** Monthly Payroll Report Access: disable reports from a month on ("Disable"), or enable all; plus the number of months shown. */
export function MonthlyAccessForm({ initial }: { initial: MonthlyAccess }) {
  const [mode, setMode] = useState<'Disable' | 'Enable'>(initial.enableAll ? 'Enable' : 'Disable');
  // the server sends "YYYY-MM" (empty for "Enable all"); the picker holds the month number and the year apart
  const [monthNo, setMonthNo] = useState<string | null>(initial.month ? String(Number(initial.month.slice(5, 7))) : null);
  const [year, setYear] = useState<string | null>(initial.month ? initial.month.slice(0, 4) : null);
  const [count, setCount] = useState(initial.noOfMonth === null ? '' : String(initial.noOfMonth));
  const { save } = useMonthlyAccess();
  const errors = useFormErrors(save.error);

  return (
    <>
      <Card>
        {/* LEGACY (MonthlyPayrollReportAccess.aspx): "Select Month" is always shown, whichever radio is picked */}
        <MonthPicker label="Select" month={monthNo} year={year} onMonth={setMonthNo} onYear={setYear} error={errors.field('month')} />
        <RadioGroup
          label="Monthly access"
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Disable from month', value: 'Disable' },
            { label: 'Enable all', value: 'Enable' },
          ]}
        />
        <TextField label="No of Month" value={count} onChangeText={setCount} keyboardType="number-pad" error={errors.field('MonthNo')} />
      </Card>
      <FormError error={errors.general ? save.error : null} />
      <Button title="Save" icon="save-outline" loading={save.isPending} onPress={() => save.mutate({ MonthlyAccess: mode, month: monthValue(monthNo, year), MonthNo: count })} />
    </>
  );
}
