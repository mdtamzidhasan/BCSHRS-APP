import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/app-text';
import { KeyValue, SectionHeader, SwitchRow } from '@/components/ui/misc';
import { SelectField } from '@/components/ui/select-field';
import { EmptyState, ErrorState, FormError, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, radius, spacing } from '@/theme/tokens';

import type { JobEmployee } from '../api';
import { GRADES, GRADE_STEPS, PLACEMENT_LEVELS, POSITION_TYPES, type JobInfoApi } from '../use-job-info';

const toOptions = (list: string[]) => list.map((item) => ({ label: item, value: item }));

/** Select Employee: searchable list in a full-screen sheet. */
function EmployeePicker({ visible, job, onClose }: { visible: boolean; job: JobInfoApi; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const rows = (job.employees.data ?? [])
    .filter((row) => !term || [row.EmployeeCode, row.EmployeeName, row.EmployeeDesignation, row.WsName].some((value) => String(value).toLowerCase().includes(term)))
    .slice(0, 60);

  const choose = (row: JobEmployee) => {
    job.pick(row);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} onShow={job.loadEmployees}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <AppText variant="subheading">Select Employee</AppText>
          <Button title="Close" size="sm" variant="secondary" block={false} onPress={onClose} />
        </View>
        <TextField placeholder="Search code / name / designation" value={search} onChangeText={setSearch} autoCapitalize="none" />
        {job.employees.isFetching && !job.employees.data ? (
          <LoadingView />
        ) : job.employees.isError ? (
          <ErrorState error={job.employees.error} onRetry={() => job.employees.refetch()} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => row.EmployeeCode}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<EmptyState title="No employees" />}
            ListFooterComponent={rows.length === 60 ? <AppText tone="muted" variant="caption">Showing the first 60 matches. Refine the search to narrow down.</AppText> : null}
            renderItem={({ item }) => (
              <Pressable onPress={() => choose(item)} style={styles.pickRow}>
                <AppText weight="medium">
                  {item.EmployeeCode} - {item.EmployeeName}
                </AppText>
                <AppText tone="muted" variant="caption">
                  {item.EmployeeDesignation} | {item.WsName}
                </AppText>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

export function JobInfoView({ job }: { job: JobInfoApi }) {
  const [picking, setPicking] = useState(false);
  const { employee, position } = job;
  const canSave = job.access.data?.hasUpdateAccess ?? false;

  return (
    <View style={styles.stack}>
      <Card outlined>
        <SectionHeader title="Employee" />
        <View style={styles.fields}>
          <Button title={employee ? 'Change Employee' : 'Select Employee'} icon="people-outline" variant="info" onPress={() => setPicking(true)} />
          {employee ? (
            <View style={styles.facts}>
              <KeyValue label="Code" value={employee.EmployeeCode} />
              <KeyValue label="Name" value={employee.EmployeeName} />
              <KeyValue label="Designation" value={employee.EmployeeDesignation} />
              <KeyValue label="Location In Hier." value={employee.WsName} />
              <KeyValue label="Grade" value={`${employee.GradeCategory}-${employee.Grade},${employee.GradeStep}`} />
              <KeyValue label="Salary" value={employee.CalculatedSalary} />
            </View>
          ) : (
            <AppText tone="muted">Select an employee to record a transfer, earnings or deductions.</AppText>
          )}
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Job Info" />
        <View style={styles.fields}>
          <SwitchRow label="New Position" value={job.showNew} onChange={job.toggleNewPosition} />
          {job.showNew ? (
            <>
              <SelectField label="New Position" value={position.actType || null} options={toOptions(POSITION_TYPES)} onChange={(value) => job.patch({ actType: value })} />
              <SelectField label="Placement Level" value={position.wsType || null} options={toOptions(PLACEMENT_LEVELS)} onChange={job.setPlacementLevel} />
              <SelectField label="Job Placement" value={position.wsName || null} options={toOptions(job.jobSpaces)} onChange={job.setPlacement} />
              <SelectField label="Designation" value={position.desig || null} options={toOptions(job.designations)} onChange={(value) => job.patch({ desig: value })} />
              <SelectField label="Grade Category" value={position.gradeCategory || null} options={toOptions(job.gradeCategories)} onChange={(value) => job.patch({ gradeCategory: value })} />
              <SelectField label="Grade" value={position.grade || null} options={toOptions(GRADES)} onChange={(value) => job.patch({ grade: value })} />
              <SelectField label="Step" value={position.gradeStep || null} options={toOptions(GRADE_STEPS)} onChange={(value) => job.patch({ gradeStep: value })} />
              <TextField label="Date of Decision (YYYY-MM-DD)" value={position.actDate} onChangeText={(value) => job.patch({ actDate: value })} keyboardType="numbers-and-punctuation" />
              <TextField label="Effective Days (YYYY-MM-DD)" value={position.effDate} onChangeText={(value) => job.patch({ effDate: value })} keyboardType="numbers-and-punctuation" />
              <TextField label="Remarks" multiline maxLength={150} value={position.remarks} onChangeText={(value) => job.patch({ remarks: value })} />
            </>
          ) : null}
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Earnings" />
        <View style={styles.fields}>
          <SwitchRow label="Copy from existing earnings" description="Turn on to edit earnings" value={job.earnings !== null} onChange={job.toggleEarnings} disabled={job.loadingEarnings} />
          {job.loadingEarnings ? <LoadingView /> : null}
          <FormError error={job.earningsError} />
          {job.earnings ? (
            <>
              <TextField label="Gross Salary" keyboardType="numeric" value={job.grossSal} onChangeText={job.setGrossSal} />
              <View style={styles.facts}>
                <KeyValue label="Total Salary" value={String(job.totals.total)} />
                <KeyValue label="Salary Portion" value={String(job.totals.monthly)} />
                <KeyValue label="Unadjusted" value={String(job.totals.difference)} />
              </View>
              {job.earnings.map((row, index) => (
                <View key={row.CompCode} style={styles.component}>
                  <AppText weight="bold">{row.CompName}</AppText>
                  <TextField label="Amount" keyboardType="numeric" value={row.CashAmount} onChangeText={(value) => job.editEarning(index, 'CashAmount', value)} />
                  <TextField label="No Cash Benefit" value={row.NonCash} onChangeText={(value) => job.editEarning(index, 'NonCash', value)} />
                  <TextField label="No Cash Benefit (Eq. of BDT)" keyboardType="numeric" value={row.NonCashAmount} onChangeText={(value) => job.editEarning(index, 'NonCashAmount', value)} />
                  <TextField label="Remarks" value={row.Remarks} onChangeText={(value) => job.editEarning(index, 'Remarks', value)} />
                </View>
              ))}
            </>
          ) : null}
        </View>
      </Card>

      <Card outlined>
        <SectionHeader title="Deduction" />
        <View style={styles.fields}>
          <SwitchRow label="Copy deductions" description="Turn on to edit deductions" value={job.deduction !== null} onChange={job.toggleDeduction} disabled={job.loadingDeduction} />
          {job.loadingDeduction ? <LoadingView /> : null}
          <FormError error={job.deductionError} />
          {job.deductionRows.map((row) => (
            <TextField key={row.column} label={row.caption} placeholder="Amount" keyboardType="numeric" value={row.value} onChangeText={(value) => job.editDeduction(row.column, value)} />
          ))}
        </View>
      </Card>

      <FormError error={job.save.error} />
      <Button title="Update" icon="save-outline" loading={job.save.isPending} disabled={!canSave} onPress={job.submit} />
      {!canSave && job.access.isSuccess ? <AppText tone="muted" variant="caption">Your role cannot update job info.</AppText> : null}
      <Button title="Reset" variant="secondary" onPress={job.reset} />

      <EmployeePicker visible={picking} job={job} onClose={() => setPicking(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  fields: { marginTop: spacing.md, gap: spacing.xs },
  facts: { marginTop: spacing.sm },
  component: { borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  modal: { flex: 1, backgroundColor: palette.background, padding: spacing.lg, paddingTop: spacing.xxl },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  pickRow: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.border },
});
