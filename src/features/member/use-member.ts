import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import { endSession } from '@/api/client';
import { toast } from '@/components/ui/toast';
import { useFormErrors } from '@/hooks/use-form-errors';
import { API_BASE_URL } from '@/lib/config';

import { addMobile, changePassword, changeUsername, getCurrentMobile, getDashboard, getPdfs, getReport, sendContact, type ReportKind, type ReportParams } from './api';
import type { ReportInput } from './reports';
import { REPORT_ENTRIES, type ReportEntry } from './reports';

export function useMemberDashboard() {
  return useQuery({ queryKey: ['member', 'dashboard'], queryFn: getDashboard });
}

export function useMemberPdfs() {
  return useQuery({ queryKey: ['member', 'pdfs'], queryFn: getPdfs });
}

/** Home filters (income year, month, PF year) with the dashboard's defaults, and navigation to a report. */
export function useReportPicker() {
  const dashboard = useMemberDashboard();
  const router = useRouter();
  const [chosen, setChosen] = useState<{ incomeYear?: string; month?: number; pfYear?: string }>({});
  const data = dashboard.data;

  const incomeYear = chosen.incomeYear ?? data?.incomeYears[0];
  const pfYear = chosen.pfYear ?? data?.pfYears[0];
  const defaultMonth = data?.selectedMonthIndex != null ? data.months[data.selectedMonthIndex]?.value : data?.months[0]?.value;
  const month = chosen.month ?? defaultMonth;

  const open = (entry: ReportEntry) => {
    const values: Record<ReportInput, string | undefined> = { income_year: incomeYear, month: month?.toString(), pf_year: pfYear };
    const missing = entry.inputs.filter((input) => !values[input]);

    if (missing.length > 0) {
      toast.error('Please choose the report period first.');
      return;
    }

    const query = entry.inputs.map((input) => `${input}=${encodeURIComponent(values[input] ?? '')}`).join('&');
    router.push((query ? `${entry.href}?${query}` : entry.href) as never);
  };

  return {
    dashboard,
    incomeYear,
    month,
    pfYear,
    setIncomeYear: (value: string) => setChosen((state) => ({ ...state, incomeYear: value })),
    setMonth: (value: number) => setChosen((state) => ({ ...state, month: value })),
    setPfYear: (value: string) => setChosen((state) => ({ ...state, pfYear: value })),
    entries: REPORT_ENTRIES.filter((entry) => data?.flags[entry.flag]),
    showPdfs: !!data?.flags.pdf,
    open,
  };
}

/** One report, fetched with the filters passed by Home in the route query. */
export function useMemberReport(kind: ReportKind) {
  const search = useLocalSearchParams<Record<string, string>>();
  const params: ReportParams = {};

  for (const key of ['income_year', 'pf_year', 'month'] as const) {
    if (search[key]) {
      params[key] = String(search[key]);
    }
  }

  return { params, query: useQuery({ queryKey: ['member', 'report', kind, params], queryFn: () => getReport(kind, params) }) };
}

/** Opens a published PDF (absolute links as they are, relative ones against the server). */
export function openPdf(url: string) {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const target = /^https?:\/\//i.test(url) ? url : `${origin}/${url.replace(/^\/+/, '')}`;

  void Linking.openURL(target);
}

/** On success the API ends every token of the account (password change), so the message is shown and the session is ended here. */
export function useChangePassword() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: async (response) => {
      toast.success(response.message ?? 'Password changed successfully.');
      queryClient.clear();
      await endSession('Your password was changed. Please log in again.');
    },
  });

  return { values, set: (key: keyof typeof values, value: string) => setValues((state) => ({ ...state, [key]: value })), submit: () => mutation.mutate(values), mutation, errors: useFormErrors(mutation.error) };
}

export function useChangeUsername() {
  const [username, setUsername] = useState('');
  const mutation = useMutation({ mutationFn: changeUsername, onSuccess: (response) => toast.success(response.message ?? 'User name changed.') });

  return { username, setUsername, submit: () => mutation.mutate({ new_username: username.trim() }), mutation, errors: useFormErrors(mutation.error) };
}

export function useAddMobile() {
  const queryClient = useQueryClient();
  const current = useQuery({ queryKey: ['member', 'mobile'], queryFn: getCurrentMobile });
  const [mobile, setMobile] = useState('');
  const mutation = useMutation({
    mutationFn: addMobile,
    onSuccess: (response) => {
      toast.success(response.message ?? 'Mobile number saved.');
      void queryClient.invalidateQueries({ queryKey: ['member'] });
      setMobile('');
    },
  });

  return { current, mobile, setMobile, submit: () => mutation.mutate({ mobile: mobile.trim() }), mutation, errors: useFormErrors(mutation.error) };
}

export function useContactHr() {
  const [message, setMessage] = useState('');
  const mutation = useMutation({
    mutationFn: sendContact,
    onSuccess: (response) => {
      toast.success(response.message?.trim() ?? 'Your comment has been sent.');
      setMessage('');
    },
  });

  return { message, setMessage, submit: () => mutation.mutate({ message }), mutation, errors: useFormErrors(mutation.error) };
}
