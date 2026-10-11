import { useState } from 'react';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader, SwitchRow } from '@/components/ui/misc';
import { SelectField } from '@/components/ui/select-field';
import { FormError } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { useFormErrors } from '@/hooks/use-form-errors';

import type { AdminUser, Company, CreateUserInput, Role, UserInput } from '../api';
import { useCreateUser, useUnlockUser, useUpdateUser } from '../use-users';
import { UserStatusBadges } from './user-cards';

const EMPTY_USER: CreateUserInput = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  company_id: '',
  role_id: '',
  employee_id: '',
  mobile: '',
  job_code: '',
  is_approved: true,
};

/** Add User: account, password (8-15 chars with lower, upper, digit and a symbol), company and role. */
export function CreateUserForm({ companies, roles }: { companies: Company[]; roles: Role[] }) {
  const [form, setForm] = useState<CreateUserInput>(EMPTY_USER);
  const create = useCreateUser();
  const errors = useFormErrors(create.error);
  const set = <K extends keyof CreateUserInput>(name: K, value: CreateUserInput[K]) => setForm((current) => ({ ...current, [name]: value }));

  return (
    <>
      <Card>
        <SectionHeader title="Account" />
        <TextField label="User Name" value={form.username} onChangeText={(value) => set('username', value)} autoCapitalize="none" autoCorrect={false} error={errors.field('username')} />
        <TextField label="Email" value={form.email} onChangeText={(value) => set('email', value)} keyboardType="email-address" autoCapitalize="none" error={errors.field('email')} />
        <TextField label="Password" password value={form.password} onChangeText={(value) => set('password', value)} error={errors.field('password')} hint="8-15 characters with a lower case, an upper case, a digit and a symbol." />
        <TextField label="Confirm Password" password value={form.password_confirmation} onChangeText={(value) => set('password_confirmation', value)} />
        <SwitchRow label="Approved (active)" value={form.is_approved} onChange={(value) => set('is_approved', value)} />
      </Card>
      <Card>
        <SectionHeader title="Company and role" />
        <SelectField
          label="Company"
          value={form.company_id}
          options={companies.map((company) => ({ label: company.cname, value: String(company.id) }))}
          onChange={(value) => set('company_id', value)}
          error={errors.field('company_id')}
        />
        <SelectField label="Role" value={form.role_id} options={roles.map((role) => ({ label: role.RoleName, value: role.RoleId }))} onChange={(value) => set('role_id', value)} error={errors.field('role_id')} />
        <TextField label="Employee ID" value={form.employee_id} onChangeText={(value) => set('employee_id', value)} error={errors.field('employee_id')} />
        <TextField label="Job Code" value={form.job_code} onChangeText={(value) => set('job_code', value)} error={errors.field('job_code')} />
        <TextField label="Mobile (OTP login of admin accounts)" value={form.mobile} onChangeText={(value) => set('mobile', value)} keyboardType="phone-pad" error={errors.field('mobile')} />
      </Card>
      <FormError error={errors.general ? create.error : null} />
      <Button title="Create User" icon="person-add-outline" loading={create.isPending} onPress={() => create.mutate(form)} />
    </>
  );
}

/** Edit User: only the working legacy fields (Email, Comment, Approved, Online) plus Unlock. */
export function EditUserForm({ user }: { user: AdminUser }) {
  const [form, setForm] = useState<UserInput>({
    email: user.membership?.Email ?? '',
    comment: user.membership?.Comment ?? '',
    is_approved: !!user.membership?.IsApproved,
    is_online: !!user.IsOnline,
  });
  const update = useUpdateUser(user.UserId);
  const unlock = useUnlockUser(user.UserId);
  const errors = useFormErrors(update.error);
  const locked = unlock.data ? !!unlock.data.data.user.membership?.IsLockedOut : !!user.membership?.IsLockedOut;
  const set = <K extends keyof UserInput>(name: K, value: UserInput[K]) => setForm((current) => ({ ...current, [name]: value }));

  return (
    <>
      <Card>
        <AppText variant="heading">{user.UserName}</AppText>
        <UserStatusBadges approved={form.is_approved} online={form.is_online} locked={locked} />
      </Card>
      <Card>
        <TextField label="Email" value={form.email} onChangeText={(value) => set('email', value)} keyboardType="email-address" autoCapitalize="none" error={errors.field('email')} />
        <TextField label="Comment" value={form.comment} onChangeText={(value) => set('comment', value)} multiline error={errors.field('comment')} />
        <SwitchRow label="Approved (active)" value={form.is_approved} onChange={(value) => set('is_approved', value)} />
        <SwitchRow label="Online" value={form.is_online} onChange={(value) => set('is_online', value)} />
      </Card>
      <FormError error={errors.general ? update.error : null} />
      <Button title="Save" icon="save-outline" loading={update.isPending} onPress={() => update.mutate(form)} />
      {locked ? <Button title="Unlock User" variant="secondary" icon="lock-open-outline" loading={unlock.isPending} onPress={() => unlock.mutate()} /> : null}
    </>
  );
}
