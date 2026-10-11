import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';

import {
  advancePfYear,
  createPfYear,
  fetchCurrentPfYear,
  fetchPfUploadMeta,
  previewPfUpload,
  savePfUpload,
  type PfPreview,
  type PfUploadKind,
  type PfUploadParams,
} from './api';
import type { PickedFile } from '@/components/ui/misc';
import { monthLabel } from './month';

// ------------------------------------------------------------------ PF year
export function usePfYear() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'payroll', 'pf-year'], queryFn: fetchCurrentPfYear });
  const [fromMonth, setFromMonth] = useState<string | null>(null);
  const [fromYear, setFromYear] = useState<string | null>(null);
  const [toMonth, setToMonth] = useState<string | null>(null);
  const [toYear, setToYear] = useState<string | null>(null);

  const done = (message: string | null) => {
    if (message) {
      toast.success(message);
    }
    void client.invalidateQueries({ queryKey: ['admin', 'payroll', 'pf-year'] });
  };

  const create = useMutation({
    mutationFn: () => createPfYear(monthLabel(fromMonth, fromYear), monthLabel(toMonth, toYear)),
    onSuccess: (response) => done(response.message),
  });

  const advance = useMutation({ mutationFn: advancePfYear, onSuccess: (response) => done(response.message) });

  return { query, create, advance, fromMonth, setFromMonth, fromYear, setFromYear, toMonth, setToMonth, toYear, setToYear };
}

// ------------------------------------------------------------------ PF balance upload / profit allocation
export function usePfUpload(kind: PfUploadKind) {
  const meta = useQuery({ queryKey: ['admin', 'payroll', 'pf-upload', kind], queryFn: () => fetchPfUploadMeta(kind) });
  const [file, setFile] = useState<PickedFile | null>(null);
  const [pfYear, setPfYear] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [workSheet, setWorkSheet] = useState('');
  const [empCol, setEmpCol] = useState('1');
  const [valueCol, setValueCol] = useState('2');
  const [preview, setPreview] = useState<PfPreview | null>(null);

  const isExcel = /\.xlsx?$/i.test(file?.name ?? '');
  const params: PfUploadParams = { pfYear: pfYear ?? '', field: field ?? '', month: month ?? undefined, workSheet, empCol, valueCol };
  const ready = !!file && !!pfYear && !!field && (kind === 'balance' || !!month) && !!empCol && !!valueCol && (!isExcel || workSheet.trim() !== '');

  const read = useMutation({
    mutationFn: () => previewPfUpload(kind, file as PickedFile, params),
    onSuccess: (data) => setPreview(data),
  });

  const save = useMutation({
    mutationFn: () => savePfUpload(kind, (preview as PfPreview).token, params),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Save successful.');
      setPreview(null);
      setFile(null);
    },
  });

  /** Changing the file or columns invalidates a previous preview (the server kept the old file under its token). */
  const reset = () => setPreview(null);

  return {
    meta,
    file,
    setFile: (picked: PickedFile) => {
      setFile(picked);
      reset();
    },
    pfYear,
    setPfYear,
    field,
    setField,
    month,
    setMonth,
    workSheet,
    setWorkSheet,
    empCol,
    setEmpCol,
    valueCol,
    setValueCol,
    isExcel,
    ready,
    preview,
    read,
    save,
    reset,
  };
}
