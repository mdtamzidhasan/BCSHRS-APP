import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { toast } from '@/components/ui/toast';

import { instantMessageApi, type MessageEmployee } from './api';

export type Audience = 2 | 3 | 4;

export function useInstantMessage() {
  const filters = useQuery({ queryKey: ['admin', 'instant-message', 'filters'], queryFn: instantMessageApi.filters });

  const [audience, setAudience] = useState<Audience>(2);
  const [department, setDepartment] = useState('');
  const [costCenter, setCostCenter] = useState('');
  const [employees, setEmployees] = useState<MessageEmployee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');

  const value = audience === 3 ? department : audience === 4 ? costCenter : '';

  const load = useMutation({
    mutationFn: () => instantMessageApi.employees(audience, value),
    onSuccess: (rows) => {
      setEmployees(rows);
      setSelected(new Set(rows.map((row) => row.code)));
    },
  });

  const send = useMutation({
    mutationFn: () =>
      instantMessageApi.send(
        employees.filter((row) => selected.has(row.code)).map((row) => ({ ename: row.ename, mobile: row.mobile, description: text })),
      ),
    onSuccess: (message) => {
      toast.success(message);
      setText('');
    },
  });

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return term ? employees.filter((row) => [row.code, row.ename, row.desig, row.dept, row.mobile].some((field) => field.toLowerCase().includes(term))) : employees;
  }, [employees, search]);

  const toggle = (code: string) =>
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }

      return next;
    });

  const allSelected = visible.length > 0 && visible.every((row) => selected.has(row.code));

  return {
    filters,
    audience,
    setAudience: (next: Audience) => {
      setAudience(next);
      setEmployees([]);
      setSelected(new Set());
    },
    department: department || filters.data?.departments[0] || '',
    setDepartment,
    costCenter: costCenter || filters.data?.costCenters[0]?.value || '',
    setCostCenter,
    load,
    loadEmployees: () => load.mutate(),
    employees,
    visible,
    search,
    setSearch,
    selected,
    toggle,
    allSelected,
    toggleAll: () =>
      setSelected((current) => {
        const next = new Set(current);

        for (const row of visible) {
          if (allSelected) {
            next.delete(row.code);
          } else {
            next.add(row.code);
          }
        }

        return next;
      }),
    text,
    setText,
    send,
    canSend: selected.size > 0 && text.trim().length > 0,
    submit: () => send.mutate(),
  };
}

export type InstantMessageApi = ReturnType<typeof useInstantMessage>;
