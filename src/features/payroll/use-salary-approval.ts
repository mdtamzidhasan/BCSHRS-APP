import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';

import { fetchApprovalPage, submitApproval, type ApprovalFilter, type ApprovalPage } from './api';
import { monthValue } from './month';

export function useSalaryApproval(page: ApprovalPage) {
  const client = useQueryClient();
  const now = new Date();
  const [fromMonth, setFromMonth] = useState<string | null>(String(now.getMonth() + 1));
  const [fromYear, setFromYear] = useState<string | null>(String(now.getFullYear()));
  const [toMonth, setToMonth] = useState<string | null>(String(now.getMonth() + 1));
  const [toYear, setToYear] = useState<string | null>(String(now.getFullYear()));
  const [currency, setCurrency] = useState('BDT');
  // the filter that was applied with "Show" (the page call also stores the period server-side for the action calls)
  const [applied, setApplied] = useState<ApprovalFilter | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reprocess, setReprocess] = useState(false);

  const query = useQuery({
    queryKey: ['admin', 'payroll', 'approval', page, applied],
    queryFn: () => fetchApprovalPage(page, applied as ApprovalFilter),
    enabled: !!applied,
  });

  const show = () => setApplied({ dateFrom: monthValue(fromMonth, fromYear), dateTo: monthValue(toMonth, toYear), currency: currency.trim() });

  const act = useMutation({
    mutationFn: () => submitApproval(page, remarks.trim(), reprocess),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Done.');
      setRemarks('');
      setReprocess(false);
      void client.invalidateQueries({ queryKey: ['admin', 'payroll', 'approval'] });
    },
  });

  return {
    query,
    applied,
    show,
    act,
    fromMonth,
    setFromMonth,
    fromYear,
    setFromYear,
    toMonth,
    setToMonth,
    toYear,
    setToYear,
    currency,
    setCurrency,
    remarks,
    setRemarks,
    reprocess,
    setReprocess,
    canShow: !!fromMonth && !!fromYear && !!toMonth && !!toYear && currency.trim() !== '',
  };
}
