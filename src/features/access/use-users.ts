import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { usersApi, type CreateUserInput, type UserFilters, type UserInput } from './api';
import { accessKey, usePagedQuery, useSave } from './use-save';

const usersKey = accessKey('users');

export const EMPTY_FILTERS: UserFilters = { search: '', status: '', locked: '', online: '', role: '', sort: '' };

/** The filtered, searchable, sortable user list; `draft` is edited freely, `apply` runs the search. */
export function useUserList() {
  const [draft, setDraft] = useState<UserFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<UserFilters>(EMPTY_FILTERS);
  const paged = usePagedQuery(accessKey('users', 'list', applied), (page) => usersApi.page(applied, page), (payload) => payload.users);

  return {
    ...paged,
    roles: paged.first?.roles ?? [],
    draft,
    setField: (name: keyof UserFilters, value: string) => setDraft((current) => ({ ...current, [name]: value })),
    /** Selects (not the search box) take effect at once. */
    setSelect: (name: keyof UserFilters, value: string) => {
      const next = { ...draft, [name]: value };
      setDraft(next);
      setApplied(next);
    },
    apply: () => setApplied(draft),
    reset: () => {
      setDraft(EMPTY_FILTERS);
      setApplied(EMPTY_FILTERS);
    },
  };
}

export function useUserFormData() {
  return useQuery({ queryKey: accessKey('users', 'form'), queryFn: usersApi.formData });
}

export function useCreateUser() {
  const router = useRouter();

  return useSave((input: CreateUserInput) => usersApi.create(input), [usersKey], { fallback: 'User created successfully.', onDone: () => router.back() });
}

export function useUser(id: string) {
  return useQuery({ queryKey: accessKey('users', 'one', id), queryFn: () => usersApi.one(id) });
}

export function useUpdateUser(id: string) {
  const router = useRouter();

  return useSave((input: UserInput) => usersApi.update(id, input), [usersKey], { fallback: 'User updated successfully.', onDone: () => router.back() });
}

export function useUnlockUser(id: string) {
  return useSave(() => usersApi.unlock(id), [usersKey], { fallback: 'User unlocked.' });
}

export function useDeleteUser() {
  return useSave((id: string) => usersApi.remove(id), [usersKey], { fallback: 'User deleted successfully.' });
}

/** Users by Role: the role filter plus the user grid (100 per page). */
export function useUsersByRole() {
  const [role, setRole] = useState('');
  const paged = usePagedQuery(accessKey('users-by-role', role), (page) => usersApi.byRole(role, page), (payload) => payload.users);

  return { ...paged, role, setRole, roles: paged.first?.roles ?? [] };
}

export function useUsersByCompany() {
  return useQuery({ queryKey: accessKey('users-by-company'), queryFn: usersApi.byCompany });
}
