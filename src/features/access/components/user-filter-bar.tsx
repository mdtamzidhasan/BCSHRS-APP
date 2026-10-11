import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { spacing } from '@/theme/tokens';

import type { Role, UserFilters } from '../api';

const ANY = '';

const STATUS = [
  { label: 'All', value: ANY },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];
const LOCKED = [
  { label: 'All', value: ANY },
  { label: 'Locked out', value: '1' },
  { label: 'Not locked', value: '0' },
];
const ONLINE = [
  { label: 'All', value: ANY },
  { label: 'Online', value: '1' },
  { label: 'Offline', value: '0' },
];
const SORT = [
  { label: 'Default (A-Z)', value: ANY },
  { label: 'User name', value: 'username' },
  { label: 'Online status', value: 'online' },
  { label: 'Approval status', value: 'approved' },
  { label: 'Locked status', value: 'locked' },
];

interface Props {
  draft: UserFilters;
  roles: Role[];
  onField: (name: keyof UserFilters, value: string) => void;
  onSelect: (name: keyof UserFilters, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

/** Search by user name / employee ID plus the Active, Locked, Online, Role filters and the sort order of the user list. */
export function UserFilterBar({ draft, roles, onField, onSelect, onSearch, onReset }: Props) {
  return (
    <Card>
      <TextField label="Search" placeholder="User name or Employee ID" value={draft.search} onChangeText={(value) => onField('search', value)} onSubmitEditing={onSearch} returnKeyType="search" autoCapitalize="none" />
      <SelectField label="Status" value={draft.status} options={STATUS} onChange={(value) => onSelect('status', value)} />
      <SelectField label="Locked out" value={draft.locked} options={LOCKED} onChange={(value) => onSelect('locked', value)} />
      <SelectField label="Online" value={draft.online} options={ONLINE} onChange={(value) => onSelect('online', value)} />
      <SelectField label="Role" value={draft.role} options={[{ label: 'All roles', value: ANY }, ...roles.map((role) => ({ label: role.RoleName, value: role.RoleId }))]} onChange={(value) => onSelect('role', value)} />
      <SelectField label="Sort by" value={draft.sort} options={SORT} onChange={(value) => onSelect('sort', value)} />
      <View style={styles.actions}>
        <Button title="Search" icon="search-outline" block={false} onPress={onSearch} style={styles.action} />
        <Button title="Reset" variant="secondary" block={false} onPress={onReset} style={styles.action} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
