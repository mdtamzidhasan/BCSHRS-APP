import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { assignmentApi, rolesApi, superAdminApi, type AssignmentData, type SuperAdmin, type UserRoleAssignment } from './api';
import { accessKey, useSave } from './use-save';

// ------------------------------------------------------------------ Roles
const rolesKey = accessKey('roles');

export function useRoles() {
  return useQuery({ queryKey: rolesKey, queryFn: rolesApi.list });
}

export function useAddRole(onAdded: () => void) {
  return useSave((roleName: string) => rolesApi.create(roleName), [rolesKey], { fallback: 'Role added.', onDone: onAdded });
}

export function useDeleteRole() {
  return useSave((roleName: string) => rolesApi.remove(roleName), [rolesKey], { fallback: 'Role deleted.' });
}

// ------------------------------------------------------------------ User role assignment
const assignmentKey = accessKey('user-role-assignment');

export interface AssignmentForm {
  id: number | null;
  user: string;
  role: string;
  company: number | null;
}

const EMPTY_ASSIGNMENT: AssignmentForm = { id: null, user: '', role: '', company: null };

export function useUserRoleAssignment() {
  const query = useQuery({ queryKey: assignmentKey, queryFn: assignmentApi.load });
  const [form, setForm] = useState<AssignmentForm>(EMPTY_ASSIGNMENT);
  const reset = () => setForm(EMPTY_ASSIGNMENT);

  const save = useSave(
    () =>
      assignmentApi.save({ id: form.id, role_id: form.role, user_name: form.user, company_id: form.company ?? 0 }),
    [assignmentKey],
    { fallback: 'Successful.', onDone: reset },
  );
  const remove = useSave((id: number) => assignmentApi.remove(id), [assignmentKey], { fallback: 'Successful.', onDone: reset });

  return {
    query,
    form,
    setForm,
    reset,
    save,
    remove,
    edit: (row: UserRoleAssignment) => setForm({ id: row.UserRoleId, user: row.UserName, role: row.RoleId, company: row.CompanyProfileId }),
  };
}

export function assignmentOptions(data: AssignmentData) {
  return {
    users: data.users.map((user) => ({ label: user.usr, value: user.usr })),
    roles: data.roles.map((role) => ({ label: role.RoleName, value: role.RoleId })),
    companies: data.companies.map((company) => ({ label: company.cname, value: company.id })),
  };
}

// ------------------------------------------------------------------ Super admin
const superAdminKey = accessKey('super-admin');

export interface SuperAdminForm {
  id: number | null;
  user: string;
  domain: string;
  active: boolean;
}

const EMPTY_SUPER_ADMIN: SuperAdminForm = { id: null, user: '', domain: 'BCSHRS1', active: true };

export function useSuperAdmin() {
  const query = useQuery({ queryKey: superAdminKey, queryFn: superAdminApi.load });
  const [form, setForm] = useState<SuperAdminForm>(EMPTY_SUPER_ADMIN);
  const reset = () => setForm(EMPTY_SUPER_ADMIN);

  const save = useSave(() => superAdminApi.save({ id: form.id, user_name: form.user, domain: form.domain, is_active: form.active }), [superAdminKey], {
    fallback: 'Success.',
    onDone: reset,
  });
  const remove = useSave((id: number) => superAdminApi.remove(id), [superAdminKey], { fallback: 'Success.', onDone: reset });

  return {
    query,
    form,
    setForm,
    reset,
    save,
    remove,
    edit: (row: SuperAdmin) => setForm({ id: row.Id, user: row.UserName, domain: row.DomainName, active: !!row.IsActive }),
  };
}
