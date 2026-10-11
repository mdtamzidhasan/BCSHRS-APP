import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';

import {
  deleteGroup,
  fetchGroups,
  fetchMapping,
  fetchSection50,
  fetchSorting,
  saveGroup,
  saveMapping,
  saveSection50,
  saveSorting,
  type ComponentGroup,
  type ComponentKind,
  type Section50Component,
  type SortRow,
} from './api';

const key = (kind: ComponentKind, part: string, ...rest: unknown[]) => ['admin', 'payroll', 'components', kind, part, ...rest];

// ------------------------------------------------------------------ groups
export function useComponentGroups(kind: ComponentKind) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: key(kind, 'groups'), queryFn: () => fetchGroups(kind) });
  const [editing, setEditing] = useState<ComponentGroup | null>(null);
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [toDelete, setToDelete] = useState<ComponentGroup | null>(null);

  const clear = () => {
    setEditing(null);
    setGroupId('');
    setGroupName('');
  };

  const refresh = () => void client.invalidateQueries({ queryKey: ['admin', 'payroll', 'components', kind] });

  const save = useMutation({
    mutationFn: () => saveGroup(kind, { id: editing?.id, group_id: groupId.trim(), group_name: groupName.trim() }),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Successful.');
      clear();
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (group: ComponentGroup) => deleteGroup(kind, group.group_id),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Successful.');
      setToDelete(null);
      refresh();
    },
    onError: () => setToDelete(null),
  });

  const edit = (group: ComponentGroup) => {
    save.reset();
    setEditing(group);
    setGroupId(group.group_id);
    setGroupName(group.group_name);
  };

  return { query, editing, groupId, setGroupId, groupName, setGroupName, save, remove, edit, cancel: clear, toDelete, setToDelete };
}

// ------------------------------------------------------------------ mapping
export function useComponentMapping(kind: ComponentKind) {
  const client = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // codes the admin toggled, per loaded group: undefined = follow the server's `selected` flags
  const [checked, setChecked] = useState<Set<string> | null>(null);

  const query = useQuery({ queryKey: key(kind, 'mapping', selectedGroup), queryFn: () => fetchMapping(kind, selectedGroup) });

  const serverCodes = (query.data?.components ?? []).filter((component) => component.selected).map((component) => component.comp_code);
  const current = checked ?? new Set(serverCodes);

  const toggle = (code: string) => {
    const next = new Set(current);

    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setChecked(next);
  };

  const save = useMutation({
    mutationFn: () => saveMapping(kind, selectedGroup as string, [...current]),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Success.');
      setChecked(null);
      void client.invalidateQueries({ queryKey: key(kind, 'mapping') });
    },
  });

  return {
    query,
    selectedGroup,
    selectGroup: (group: string) => {
      setChecked(null);
      setSelectedGroup(group);
    },
    isChecked: (code: string) => current.has(code),
    toggle,
    save,
  };
}

// ------------------------------------------------------------------ sorting
interface SortEdit {
  s_code?: string;
  comp_sl?: string;
  group_id?: string;
}

export function useComponentSorting(kind: ComponentKind) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: key(kind, 'sorting'), queryFn: () => fetchSorting(kind) });
  const [edits, setEdits] = useState<Record<string, SortEdit>>({});

  const rows = query.data?.components ?? [];

  const valueOf = (row: SortRow) => ({
    s_code: edits[row.comp_code]?.s_code ?? row.s_code ?? '',
    comp_sl: edits[row.comp_code]?.comp_sl ?? String(row.comp_sl ?? 0),
    group_id: edits[row.comp_code]?.group_id ?? row.group_id ?? '',
  });

  const change = (code: string, patch: SortEdit) => setEdits((previous) => ({ ...previous, [code]: { ...previous[code], ...patch } }));

  const save = useMutation({
    mutationFn: () =>
      saveSorting(
        kind,
        rows.map((row) => {
          const value = valueOf(row);

          return { component_code: row.comp_code, sub_code: value.s_code, sl: value.comp_sl, group_id: value.group_id };
        }),
      ),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Saved.');
      setEdits({});
      void client.invalidateQueries({ queryKey: key(kind, 'sorting') });
    },
  });

  return { query, rows, valueOf, change, save, dirty: Object.keys(edits).length > 0 };
}

// ------------------------------------------------------------------ section 50 mapping
export function useSection50() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'payroll', 'section-50'], queryFn: fetchSection50 });
  const [edits, setEdits] = useState<Record<string, number>>({});

  const components: Section50Component[] = (query.data ?? []).map((component) => ({ ...component, section150: edits[component.code] ?? component.section150 }));

  const save = useMutation({
    mutationFn: () => saveSection50(components),
    onSuccess: () => {
      toast.success('Section 50 mapping saved.');
      setEdits({});
      void client.invalidateQueries({ queryKey: ['admin', 'payroll', 'section-50'] });
    },
  });

  return { query, components, change: (code: string, value: number) => setEdits((previous) => ({ ...previous, [code]: value })), save, dirty: Object.keys(edits).length > 0 };
}
