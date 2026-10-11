import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';

import { lookupMasterApi, type LookupKind } from './api';

export interface LookupEditorState {
  kind: LookupKind;
  /** The name being edited; empty when adding. */
  original: string;
  name: string;
  description: string;
}

export const LOOKUP_LABELS: Record<LookupKind, string> = {
  'salary-circles': 'Salary Circle',
  'tax-zones': 'Tax Zone',
  banks: 'Bank',
  branches: 'Branch',
};

export function useLookupMaster() {
  const queryClient = useQueryClient();
  const [bank, setBank] = useState('');
  const [editor, setEditor] = useState<LookupEditorState | null>(null);
  const [removal, setRemoval] = useState<{ kind: LookupKind; name: string } | null>(null);

  const query = useQuery({ queryKey: ['admin', 'lookup-master', bank], queryFn: () => lookupMasterApi.get(bank), placeholderData: keepPreviousData });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'lookup-master'] });

  const save = useMutation({
    mutationFn: (state: LookupEditorState) => {
      const name = state.name.trim();

      switch (state.kind) {
        case 'salary-circles':
          return lookupMasterApi.save('salary-circles', { salary_circle: name, salary_circle_old: state.original });
        case 'tax-zones':
          return lookupMasterApi.save('tax-zones', { tax_zone: name, tax_zone_old: state.original });
        case 'banks':
          return lookupMasterApi.save('banks', { bank_name: name, description: state.description, bank_name_old: state.original });
        case 'branches':
          return lookupMasterApi.save('branches', { bank_name: bank, branch_name: name, description: state.description, branch_name_old: state.original });
      }
    },
    onSuccess: async (message) => {
      toast.success(message);
      setEditor(null);
      await refresh();
    },
  });

  const remove = useMutation({
    mutationFn: ({ kind, name }: { kind: LookupKind; name: string }) => {
      switch (kind) {
        case 'salary-circles':
          return lookupMasterApi.remove(kind, { salary_circle: name });
        case 'tax-zones':
          return lookupMasterApi.remove(kind, { tax_zone: name });
        case 'banks':
          return lookupMasterApi.remove(kind, { bank_name: name });
        case 'branches':
          return lookupMasterApi.remove(kind, { bank_name: bank, branch_name: name });
      }
    },
    onSuccess: async (message, variables) => {
      toast.success(message);
      setRemoval(null);

      if (variables.kind === 'banks' && variables.name === bank) {
        setBank('');
      }

      await refresh();
    },
    onError: (error) => {
      setRemoval(null);
      toast.error(error instanceof Error ? error.message : 'Could not delete.');
    },
  });

  return {
    query,
    bank,
    setBank,
    editor,
    openEditor: (kind: LookupKind, original = '', description = '') => {
      save.reset();
      setEditor({ kind, original, name: original, description });
    },
    editEditor: (changes: Partial<LookupEditorState>) => setEditor((current) => (current ? { ...current, ...changes } : current)),
    closeEditor: () => setEditor(null),
    save,
    submit: () => editor && save.mutate(editor),
    removal,
    askRemove: (kind: LookupKind, name: string) => setRemoval({ kind, name }),
    cancelRemove: () => setRemoval(null),
    confirmRemove: () => removal && remove.mutate(removal),
    removing: remove.isPending,
  };
}

export type LookupMasterApi = ReturnType<typeof useLookupMaster>;
