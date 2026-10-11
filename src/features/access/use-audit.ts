import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { auditApi, invalidCredentialsApi, type AuditQuery, type InvalidSearch } from './api';
import { accessKey, usePagedQuery, useSave } from './use-save';

// ------------------------------------------------------------------ Invalid credentials report
const NO_SEARCH: InvalidSearch = { user: '', date_from: '', date_to: '', applied: false };

export function useInvalidCredentials() {
  const [draft, setDraft] = useState<InvalidSearch>(NO_SEARCH);
  const [applied, setApplied] = useState<InvalidSearch>(NO_SEARCH);
  const paged = usePagedQuery(
    accessKey('invalid-credentials', applied),
    (page) => invalidCredentialsApi.page(applied, page),
    (payload) => ({ items: payload.rows, meta: { current_page: payload.page, per_page: 50, total: payload.total, last_page: payload.pageCount } }),
  );

  return {
    ...paged,
    searchErrors: paged.first?.searchErrors ?? [],
    draft,
    setField: (name: 'user' | 'date_from' | 'date_to', value: string) => setDraft((current) => ({ ...current, [name]: value })),
    search: () => setApplied({ ...draft, applied: true }),
    reset: () => {
      setDraft(NO_SEARCH);
      setApplied(NO_SEARCH);
    },
  };
}

// ------------------------------------------------------------------ Change report
export function useChangeReport() {
  const [incomeYear, setIncomeYear] = useState('');
  const [month, setMonth] = useState('');
  const [submitted, setSubmitted] = useState<AuditQuery | null>(null);

  const months = useQuery({ queryKey: accessKey('audit-log', 'months'), queryFn: auditApi.months });
  const report = useQuery({
    queryKey: accessKey('audit-log', 'report', submitted),
    queryFn: () => auditApi.report(submitted as AuditQuery),
    enabled: submitted !== null,
  });

  const invalidate = [accessKey('audit-log', 'report')];
  const archive = useSave(() => auditApi.archive(submitted as AuditQuery), invalidate, { fallback: 'Report Approved' });
  const [comment, setComment] = useState('');
  const addComment = useSave(() => auditApi.comment(submitted as AuditQuery, comment), invalidate, { fallback: 'Comment added successfully.', onDone: () => setComment('') });

  return {
    months,
    report,
    submitted,
    incomeYear,
    setIncomeYear,
    month,
    setMonth,
    /** "New Employee details" (A) or "Changed Employee details" (M) for the chosen year and month. */
    run: (eventType: AuditQuery['event_type']) => setSubmitted({ income_year: incomeYear.trim(), month, event_type: eventType }),
    archive,
    comment,
    setComment,
    addComment,
  };
}
