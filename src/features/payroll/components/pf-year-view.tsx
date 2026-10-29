import { useState } from 'react';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { FormError } from '@/components/ui/state-views';
import { useFormErrors } from '@/hooks/use-form-errors';
import { usePfYear } from '../use-pf';
import { MonthPicker } from './month-picker';

/** PF year: shows the current PF year, creates one (start / end month) or advances to the next year. */
export function PfYearView() {
  const state = usePfYear();
  const [confirm, setConfirm] = useState(false);
  const createErrors = useFormErrors(state.create.error);
  const advanceErrors = useFormErrors(state.advance.error);

  return (
    <QueryBoundary query={state.query}>
      {(current) => (
        <>
          <Card title="Current PF Year" outlined>
            <AppText variant="heading" tone="primary">
              {current ?? 'No PF year yet'}
            </AppText>
            {current ? (
              <>
                <AppText tone="muted">Creating the next year carries every active employee&apos;s PF balance forward.</AppText>
                <FormError error={advanceErrors.general || advanceErrors.field('advance') ? state.advance.error : null} />
                <Button title="Create Next Year" icon="arrow-forward-circle-outline" loading={state.advance.isPending} onPress={() => setConfirm(true)} />
              </>
            ) : null}
          </Card>

          {/* LEGACY (PFYearUI.aspx): the Start / End Month pickers are always shown; only "Create PF Year" (no year yet) uses them */}
          <Card title={current ? 'PF Year Period' : 'Create PF Year'} outlined>
            <MonthPicker label="Start" month={state.fromMonth} year={state.fromYear} onMonth={state.setFromMonth} onYear={state.setFromYear} error={createErrors.field('DateFrom')} />
            <MonthPicker label="End" month={state.toMonth} year={state.toYear} onMonth={state.setToMonth} onYear={state.setToYear} error={createErrors.field('DateTo')} />
            {current ? (
              <AppText variant="caption" tone="muted">
                A PF year already exists, so these months are not used. &quot;Create Next Year&quot; keeps the current year&apos;s start and end months.
              </AppText>
            ) : (
              <>
                <FormError error={createErrors.general ? state.create.error : null} />
                <Button title="Create PF Year" icon="calendar-outline" loading={state.create.isPending} onPress={() => state.create.mutate()} />
              </>
            )}
          </Card>

          <ConfirmDialog
            visible={confirm}
            title="Create next PF year?"
            message={`The PF year after ${current ?? ''} is created and balances are carried forward.`}
            confirmLabel="Create"
            loading={state.advance.isPending}
            onCancel={() => setConfirm(false)}
            onConfirm={() => {
              setConfirm(false);
              state.advance.mutate();
            }}
          />
        </>
      )}
    </QueryBoundary>
  );
}
