import { useQuery } from '@tanstack/react-query';

import { fetchPayrollHistory, fetchPayrollHistoryItem } from './api';

export function usePayrollHistory() {
  return useQuery({ queryKey: ['admin', 'payroll', 'history'], queryFn: fetchPayrollHistory });
}

export function usePayrollHistoryItem(id: string) {
  return useQuery({ queryKey: ['admin', 'payroll', 'history', id], queryFn: () => fetchPayrollHistoryItem(id), enabled: !!id });
}
