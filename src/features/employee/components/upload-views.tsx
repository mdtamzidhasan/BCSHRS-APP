import { View, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilePickerField, SectionHeader } from '@/components/ui/misc';
import { RecordCard } from '@/components/ui/record-card';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { palette, spacing } from '@/theme/tokens';

import type { useUploadExcel, useUploadExcelData } from '../use-upload-excel';

const toOptions = (list: string[]) => list.map((item) => ({ label: item, value: item }));
const EXCEL_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

/** New employees: template, file, preview with invalid cells, confirm. */
export function UploadExcelView({ upload }: { upload: ReturnType<typeof useUploadExcel> }) {
  const { preview } = upload;

  return (
    <View style={styles.stack}>
      <Card outlined>
        <SectionHeader title="1. Template" />
        <AppText tone="muted" style={styles.gap}>Download the Excel template, fill in one row per new employee, then upload it below.</AppText>
        <Button title="Download Template" icon="download-outline" variant="info" loading={upload.template.isPending} onPress={() => upload.template.mutate()} />
      </Card>

      <Card outlined>
        <SectionHeader title="2. Upload" />
        <View style={styles.gap}>
          <FilePickerField label="Excel file (.xlsx)" file={upload.file} onPick={upload.pick} accept={EXCEL_TYPES} />
          <FormError error={upload.uploadMutation.error} />
          <Button title="Upload" icon="cloud-upload-outline" disabled={!upload.file} loading={upload.uploadMutation.isPending} onPress={upload.runUpload} />
        </View>
      </Card>

      {upload.workbook ? (
        <Card outlined>
          <SectionHeader title="Worksheet" />
          <View style={styles.gap}>
            <AppText>{upload.workbook.fileName}</AppText>
            <SelectField label="WorkSheet Name" value={upload.sheet} options={upload.workbook.sheets.map((name, position) => ({ label: name, value: String(position) }))} onChange={upload.setSheet} />
            <FormError error={upload.previewMutation.error} />
            <Button title="Read & Preview" icon="eye-outline" loading={upload.previewMutation.isPending} onPress={upload.runPreview} />
          </View>
        </Card>
      ) : null}

      {preview ? (
        <>
          <Card outlined>
            <SectionHeader title={preview.sheetName ? `3. Preview — ${preview.sheetName}` : '3. Preview'} />
            <AppText style={styles.gap}>
              {preview.rows.length} row(s) read, {preview.invalidCount} invalid cell(s).
            </AppText>
            {preview.invalidCount > 0 ? <AppText tone="danger">Fix the highlighted cells in the file and upload it again. A file with invalid cells cannot be saved.</AppText> : null}
            <FormError error={upload.confirm.error} />
            <View style={styles.gap}>
              <Button title="Confirm Import" icon="checkmark-circle-outline" disabled={preview.invalidCount > 0 || preview.rows.length === 0} loading={upload.confirm.isPending} onPress={upload.runConfirm} />
              <Button title="Cancel" variant="secondary" onPress={upload.cancelPreview} />
            </View>
          </Card>

          {preview.rows.map((row) => {
            const invalid = row.cells.map((cell, index) => ({ cell, index })).filter(({ cell }) => !cell.is_valid);

            return (
              <RecordCard
                key={row.row_number}
                title={`Row ${row.row_number} - ${row.employee_code}`}
                fields={
                  invalid.length
                    ? invalid.map(({ cell, index }) => ({ label: `Column ${index + 1}`, value: <AppText tone="danger">{String(cell.value ?? '')} (expected {cell.expected_type})</AppText> }))
                    : [{ label: 'Status', value: <AppText tone="success">All cells valid</AppText> }]
                }
              />
            );
          })}
        </>
      ) : null}
    </View>
  );
}

/** Excel data upload: file, sheet / type / field / columns, rows read, save. */
export function UploadExcelDataView({ data }: { data: ReturnType<typeof useUploadExcelData> }) {
  const { page, form } = data;

  return (
    <View style={styles.stack}>
      <Card outlined>
        <SectionHeader title="Select a file to upload" />
        <View style={styles.gap}>
          <FilePickerField label="Excel workbook (.xls / .xlsx, up to 5 MB)" file={data.file} onPick={data.pick} accept={EXCEL_TYPES} />
          <FormError error={data.upload.error} />
          <Button title="Upload" icon="cloud-upload-outline" disabled={!data.file} loading={data.upload.isPending} onPress={data.runUpload} />
        </View>
      </Card>

      {page?.token ? (
        <Card outlined>
          <SectionHeader title={`File: ${page.fileName ?? ''}`} />
          <View style={styles.gap}>
            <SelectField label="WorkSheet Name" value={form.work_sheet || null} options={toOptions(page.sheets)} onChange={(value) => data.set('work_sheet', value)} />
            <SelectField label="Information Type" value={form.info_type || null} options={toOptions(page.infoTypes)} onChange={(value) => data.set('info_type', value)} />
            <SelectField label="Database Field Name" value={form.field_name || null} options={toOptions(data.names)} onChange={(value) => data.set('field_name', value)} />
            <TextField label="Employee Code Column (in Excel)" keyboardType="number-pad" value={form.code_col} onChangeText={(value) => data.set('code_col', value)} />
            <TextField label="Value Column (in Excel)" keyboardType="number-pad" value={form.value_col} onChangeText={(value) => data.set('value_col', value)} />
            {data.isEffective ? (
              <>
                <SelectField label="Income Year" value={form.income_year || null} options={toOptions(page.incomeYears)} onChange={(value) => data.set('income_year', value)} />
                <SelectField label="Processed Month" value={form.processed_month || null} options={toOptions(page.monthNames)} onChange={(value) => data.set('processed_month', value)} />
              </>
            ) : null}
            <FormError error={data.read.error} />
            <Button title="Read Data" icon="reader-outline" disabled={!data.canRead} loading={data.read.isPending} onPress={data.runRead} />
          </View>
        </Card>
      ) : null}

      {data.rows ? (
        <>
          <FormError error={data.save.error} />
          {data.rows.length > 0 ? <Button title="Save Data" icon="save-outline" loading={data.save.isPending} onPress={data.runSave} /> : null}
          {data.rows.map((row) => (
            <View key={row.Id} style={[styles.rowWrap, row.Status ? styles.valid : styles.invalid]}>
              <RecordCard
                title={`#${row.Id}  ${row.EmployeeCode}`}
                fields={[
                  { label: 'Name', value: row.EmployeeName || '-' },
                  { label: 'Designation', value: row.EmployeeDesignation || '-' },
                  { label: 'Value', value: String(row.FieldValue ?? '') },
                ]}
                footerFacts={[{ label: 'Status', value: row.Status ? 'Valid' : 'Unknown employee / invalid' }]}
              />
            </View>
          ))}
          {data.rows.length === 0 ? <AppText tone="muted">No rows were read from the sheet.</AppText> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  gap: { marginTop: spacing.md, gap: spacing.xs },
  rowWrap: { borderLeftWidth: 5, borderRadius: 16 },
  valid: { borderLeftColor: palette.success },
  invalid: { borderLeftColor: palette.danger },
});
