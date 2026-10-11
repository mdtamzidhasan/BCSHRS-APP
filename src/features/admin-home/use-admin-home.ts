import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { queryClient } from '@/api/query-client';
import { useAuth } from '@/hooks/use-auth';

import {
  changePassword,
  getBulkCodes,
  getBulkPrint,
  getDashboard,
  getHome,
  getPdfs,
  getReport,
  searchEmployees,
  type BulkParams,
  type ReportKey,
  type ReportParams,
} from './api';

export function useHomeOptions() {
  return useQuery({ queryKey: ['admin', 'home', 'options'], queryFn: getHome });
}

/** A debounced employee search (code, name or user name). */
export function useEmployeeSearch(term: string) {
  const [debounced, setDebounced] = useState(term.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 350);

    return () => clearTimeout(timer);
  }, [term]);

  return useQuery({ queryKey: ['admin', 'home', 'search', debounced], queryFn: () => searchEmployees(debounced), enabled: debounced.length >= 2 });
}

export function usePdfs(code: string, enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'home', 'pdfs', code], queryFn: () => getPdfs(code), enabled: enabled && code.length > 0 });
}

export function useReport(report: ReportKey, params: ReportParams, enabled = true) {
  return useQuery({ queryKey: ['admin', 'reports', report, params], queryFn: () => getReport(report, params), enabled });
}

export function useBulkCodes(report: ReportKey, params: BulkParams, enabled = true) {
  return useQuery({ queryKey: ['admin', 'home', 'list', report, params], queryFn: () => getBulkCodes(report, params), enabled });
}

export function useBulkPrint(report: ReportKey, params: BulkParams, enabled: boolean) {
  return useQuery({ queryKey: ['admin', 'home', 'print', report, params], queryFn: () => getBulkPrint(report, params), enabled });
}

export function useDashboard() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: getDashboard });
}

/** On success the API revokes the token, so the caller shows the message and the session is ended here. */
export function useChangePassword() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      queryClient.clear();

      try {
        await logout();
      } catch {
        // The token is already revoked server-side; nothing else to do.
      }
    },
  });
}
