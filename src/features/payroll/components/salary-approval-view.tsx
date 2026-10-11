import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { KeyValue, SectionHeader, SwitchRow } from '@/components/ui/misc';
import { ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import type { ApprovalPage } from '../api';
import { useSalaryApproval } from '../use-salary-approval';
import { MonthPicker } from './month-picker';

const LABELS: Record<ApprovalPage, { action: string; reprocess?: string }> = {
  creator: { action: 'Request review' },
  reviewer: { action: 'Approve', reprocess: 'Reject and reprocess' },
  approver: { action: 'Approve', reprocess: 'Reject and reprocess' },
};

/** Salary approval (creator / reviewer / approver): pick the period, see the summary per currency, comment and act. */
export function SalaryApprovalView({ page }: { page: ApprovalPage }) {
  const state = useSalaryApproval(page);
  const filterErrors = useFormErrors(state.query.error);
  const actErrors = useFormErrors(state.act.error);
  const labels = LABELS[page];
  const data = state.query.data;
  const filterInvalid = !!(filterErrors.field('date_from') || filterErrors.field('date_to') || filterErrors.field('currency'));

  return (
    <>
      <Card title="Period" outlined>
        <MonthPicker label="From" month={state.fromMonth} year={state.fromYear} onMonth={state.setFromMonth} onYear={state.setFromYear} error={filterErrors.field('date_from')} />
        <MonthPicker label="To" month={state.toMonth} year={state.toYear} onMonth={state.setToMonth} onYear={state.setToYear} error={filterErrors.field('date_to')} />
        <TextField label="Currency" value={state.currency} onChangeText={state.setCurrency} autoCapitalize="characters" error={filterErrors.field('currency')} />
        <Button title="Show" icon="search-outline" disabled={!state.canShow} loading={state.query.isFetching} onPress={state.show} />
      </Card>

      {state.applied && state.query.isPending ? <LoadingView /> : null}
      {state.query.isError && !filterInvalid ? <ErrorState error={state.query.error} onRetry={() => state.query.refetch()} /> : null}

      {data ? (
        <>
          <Card title={data.heading} outlined>
            <KeyValue label="Company" value={data.companyName ?? '-'} />
            <KeyValue label="Period" value={`${data.startPeriod} - ${data.endPeriod}`} />
            {data.table ? <AppText tone="danger">{data.table}</AppText> : null}
            {data.data.map((row) => (
              <Card key={row.Currency}>
                <KeyValue label="Currency" value={row.Currency} />
                <KeyValue label="No of Employee" value={row.TotalEmpCount} />
                <KeyValue label="Amount" value={row.Amount} />
              </Card>
            ))}
          </Card>

          {!data.table ? (
            <Card title="Continue" outlined>
              <SectionHeader title={data.title} />
              <TextField label="Remarks" value={state.remarks} onChangeText={state.setRemarks} multiline maxLength={140} error={actErrors.field('Remarks')} />
              {labels.reprocess ? <SwitchRow label={labels.reprocess} value={state.reprocess} onChange={state.setReprocess} /> : null}
              <FormError error={state.act.error} />
              <Button title={state.reprocess ? 'Reject' : labels.action} icon="checkmark-done-outline" variant={state.reprocess ? 'danger' : 'primary'} loading={state.act.isPending} onPress={() => state.act.mutate()} />
            </Card>
          ) : null}
        </>
      ) : null}
    </>
  );
}
