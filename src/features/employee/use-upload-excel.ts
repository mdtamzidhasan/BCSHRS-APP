import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import type { PickedFile } from '@/components/ui/misc';
import { toast } from '@/components/ui/toast';
import { downloadAndShare } from '@/lib/files';

import { EMPLOYEE_TEMPLATE, uploadExcelApi, uploadDataApi, type ReadDataBody, type UploadDataForm, type UploadDataPage, type UploadDataRow, type UploadPreview } from './api';

/** New-employee import: download the template, pick a file, preview, confirm. */
export function useUploadExcel() {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [preview, setPreview] = useState<UploadPreview | null>(null);

  const template = useMutation({
    mutationFn: () => downloadAndShare(EMPLOYEE_TEMPLATE.path, EMPLOYEE_TEMPLATE.fileName, EMPLOYEE_TEMPLATE.mime),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'The template could not be downloaded.'),
  });

  const previewMutation = useMutation({
    mutationFn: (picked: PickedFile) => uploadExcelApi.preview(picked),
    onSuccess: setPreview,
  });

  const confirm = useMutation({
    mutationFn: (token: string) => uploadExcelApi.confirm(token),
    onSuccess: (message) => {
      toast.success(message);
      setFile(null);
      setPreview(null);
    },
  });

  return {
    file,
    preview,
    template,
    previewMutation,
    confirm,
    pick: (picked: PickedFile) => {
      setFile(picked);
      setPreview(null);
      previewMutation.reset();
      confirm.reset();
    },
    runPreview: () => file && previewMutation.mutate(file),
    runConfirm: () => preview && confirm.mutate(preview.token),
    cancelPreview: () => setPreview(null),
  };
}

const EFFECTIVE_DATE = 'Effective Date';

const emptyForm = { work_sheet: '', info_type: '', field_name: '', code_col: '', value_col: '', income_year: '', processed_month: '' };

/** Bulk update by Excel column: upload -> read the sheet -> save. */
export function useUploadExcelData() {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [page, setPage] = useState<UploadDataPage | null>(null);
  const [form, setForm] = useState(emptyForm);

  const adopt = (data: UploadDataPage) => {
    setPage(data);
    const saved = (Array.isArray(data.form) ? {} : data.form) as UploadDataForm;
    setForm({
      work_sheet: saved.work_sheet ?? data.sheets[0] ?? '',
      info_type: saved.info_type ?? data.infoTypes[0] ?? '',
      field_name: saved.field_name ?? '',
      code_col: saved.code_col ? String(saved.code_col) : '',
      value_col: saved.value_col ? String(saved.value_col) : '',
      income_year: saved.income_year ?? data.incomeYears[0] ?? '',
      processed_month: saved.processed_month ?? data.monthNames[0] ?? '',
    });
  };

  const upload = useMutation({ mutationFn: (picked: PickedFile) => uploadDataApi.upload(picked), onSuccess: adopt });

  const read = useMutation({
    mutationFn: (body: ReadDataBody) => uploadDataApi.read(body),
    onSuccess: (data) => setPage(data),
  });

  const save = useMutation({
    mutationFn: (token: string) => uploadDataApi.save(token),
    onSuccess: (message) => {
      toast.success(message);
      setPage(null);
      setFile(null);
    },
  });

  const names = page && !Array.isArray(page.fieldNames) ? (page.fieldNames[form.info_type] ?? []) : [];
  const isEffective = form.info_type === EFFECTIVE_DATE;
  const rows: UploadDataRow[] | null = page?.rows ?? null;

  const set = (key: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value, ...(key === 'info_type' ? { field_name: '' } : {}) }));

  const runRead = () => {
    if (!page?.token) {
      return;
    }

    read.mutate({
      token: page.token,
      work_sheet: form.work_sheet,
      info_type: form.info_type,
      field_name: form.field_name,
      code_col: Number(form.code_col),
      value_col: Number(form.value_col),
      ...(isEffective ? { income_year: form.income_year, processed_month: form.processed_month } : {}),
    });
  };

  return {
    file,
    pick: (picked: PickedFile) => {
      setFile(picked);
      setPage(null);
      read.reset();
      save.reset();
    },
    upload,
    runUpload: () => file && upload.mutate(file),
    page,
    form,
    set,
    names,
    isEffective,
    rows,
    read,
    runRead,
    save,
    runSave: () => page?.token && save.mutate(page.token),
    canRead: !!form.work_sheet && !!form.info_type && !!form.field_name && Number(form.code_col) > 0 && Number(form.value_col) > 0,
  };
}
