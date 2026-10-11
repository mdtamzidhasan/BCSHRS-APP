import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { FormError } from '@/components/ui/state-views';
import { FilePickerField, SectionHeader } from '@/components/ui/misc';
import { SelectField, type Option } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';
import type { PfUploadKind } from '../api';
import { usePfUpload } from '../use-pf';
import { UploadPreview } from './upload-preview';

/** Shared body of "PF Balance Upload" and "Profit Upload": pick year/field/file/columns, read, preview, save with the token. */
export function PfUploadForm({ kind }: { kind: PfUploadKind }) {
  const form = usePfUpload(kind);
  const readErrors = useFormErrors(form.read.error);
  const saveErrors = useFormErrors(form.save.error);

  return (
    <QueryBoundary query={form.meta}>
      {(meta) => {
        const years: Option<string>[] = meta.pfYears.map((year) => ({ label: year.PFYear, value: year.PFYear }));
        const fields: Option<string>[] = Object.entries(meta.fields).map(([value, label]) => ({ label, value }));
        const months: Option<string>[] = Object.entries(meta.months ?? {}).map(([value, label]) => ({ label, value }));

        return (
          <>
            <Card title="File and columns">
              <SelectField label="PF Year" value={form.pfYear} options={years} onChange={form.setPfYear} error={readErrors.field('pf_year')} />
              {kind === 'profit' ? <SelectField label="Month" value={form.month} options={months} onChange={form.setMonth} error={readErrors.field('month')} /> : null}
              <SelectField label="Field" value={form.field} options={fields} onChange={form.setField} error={readErrors.field('field')} />
              <FilePickerField label="CSV / Excel file" file={form.file} onPick={form.setFile} error={readErrors.field('file')} />
              {form.isExcel ? <TextField label="Worksheet name" value={form.workSheet} onChangeText={form.setWorkSheet} error={readErrors.field('work_sheet')} autoCapitalize="none" /> : null}
              <TextField label="Employee code column no." value={form.empCol} onChangeText={form.setEmpCol} keyboardType="number-pad" error={readErrors.field('emp_col')} />
              <TextField label="Value column no." value={form.valueCol} onChangeText={form.setValueCol} keyboardType="number-pad" error={readErrors.field('value_col')} />
              <FormError error={readErrors.general ? form.read.error : null} />
              <Button title="Read file" icon="eye-outline" disabled={!form.ready} loading={form.read.isPending} onPress={() => form.read.mutate()} />
            </Card>
            {form.preview ? (
              <>
                <UploadPreview rows={form.preview.rows} />
                <FormError error={saveErrors.general || saveErrors.field('file') ? form.save.error : null} />
                <Button title="Save" icon="save-outline" loading={form.save.isPending} onPress={() => form.save.mutate()} />
              </>
            ) : (
              <SectionHeader title="Choose a file and tap Read file to preview" />
            )}
          </>
        );
      }}
    </QueryBoundary>
  );
}
