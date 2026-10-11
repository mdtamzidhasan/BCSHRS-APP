import { Stack } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SectionHeader } from '@/components/ui/misc';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { AuditReportView } from '@/features/access/components/audit-report-view';
import { useChangeReport } from '@/features/access/use-audit';

export default function ChangeReportScreen() {
  const screen = useChangeReport();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const ready = screen.incomeYear.trim() !== '' && screen.month !== '';
  const data = screen.report.data;
  const report = data?.report ?? null;
  // Legacy: nothing to approve or comment on when there is no record; an archived report (status True) is already approved.
  const showActions = report !== null && !(report.status !== 'NotApprove' && (report.rows ?? []).length === 0);

  return (
    <Screen refreshing={screen.report.isRefetching} onRefresh={screen.submitted ? () => screen.report.refetch() : undefined}>
      <Stack.Screen options={{ title: 'Change Report' }} />
      <QueryBoundary query={screen.months}>
        {(months) => (
          <Card title="Employee data changes">
            <TextField label="Income Year" value={screen.incomeYear} onChangeText={screen.setIncomeYear} placeholder="2023-2024" autoCapitalize="none" />
            <SelectField label="Month" value={screen.month} options={Object.values(months).map((name) => ({ label: name, value: name }))} onChange={screen.setMonth} />
            <Button title="New Employee details for the month" disabled={!ready} onPress={() => screen.run('A')} />
            <Button title="Changed Employee details for the month" variant="info" disabled={!ready} onPress={() => screen.run('M')} />
          </Card>
        )}
      </QueryBoundary>

      {screen.submitted === null ? null : screen.report.isPending ? (
        <LoadingView />
      ) : screen.report.isError ? (
        <ErrorState error={screen.report.error} onRetry={() => screen.report.refetch()} />
      ) : report ? (
        <>
          <AuditReportView report={report} />
          {showActions ? (
            <>
              {report.status !== 'True' ? (
                <>
                  <FormError error={screen.archive.error} />
                  <Button title="Approve" variant="secondary" icon="checkmark-done-outline" loading={screen.archive.isPending} onPress={() => setConfirmArchive(true)} />
                </>
              ) : null}
              <SectionHeader title="Comments" />
              <Card>
                <TextField label="Add a comment" value={screen.comment} onChangeText={screen.setComment} multiline maxLength={300} />
                <FormError error={screen.addComment.error} />
                <Button title="Add Comments" icon="chatbubble-outline" loading={screen.addComment.isPending} disabled={!screen.comment.trim()} onPress={() => screen.addComment.mutate(undefined)} />
              </Card>
              {(data?.comments ?? []).length === 0 ? (
                <AppText tone="muted">No comments yet.</AppText>
              ) : (
                (data?.comments ?? []).map((comment, index) => (
                  <Card key={`${comment.DateTime}-${index}`}>
                    <AppText weight="bold">{comment.UserName}</AppText>
                    <AppText variant="caption" tone="muted">
                      {comment.DateTime}
                    </AppText>
                    <AppText>{comment.Comments}</AppText>
                  </Card>
                ))
              )}
            </>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        visible={confirmArchive}
        title="Approve report"
        message="Approve and archive this change report?"
        confirmLabel="Approve"
        loading={screen.archive.isPending}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => screen.archive.mutate(undefined, { onSettled: () => setConfirmArchive(false) })}
      />
    </Screen>
  );
}
