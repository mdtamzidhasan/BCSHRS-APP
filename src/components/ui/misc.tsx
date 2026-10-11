import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { StyleSheet, Switch, View } from 'react-native';

import { palette, radius, spacing } from '@/theme/tokens';

import { AppText } from './app-text';
import { Button } from './button';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <AppText variant="subheading">{title}</AppText>
      {action}
    </View>
  );
}

type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const colors = badgeTones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <AppText variant="caption" weight="bold" style={{ color: colors.text }}>
        {label}
      </AppText>
    </View>
  );
}

export function SwitchRow({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <AppText weight="medium">{label}</AppText>
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: palette.primary, false: palette.border }} thumbColor={palette.white} />
    </View>
  );
}

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

/** Choose a file (Excel / CSV / image) from the phone; the chosen name is shown with a Change button. */
export function FilePickerField({
  label,
  file,
  onPick,
  accept = ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  error,
}: {
  label: string;
  file: PickedFile | null;
  onPick: (file: PickedFile) => void;
  accept?: string[];
  error?: string;
}) {
  const choose = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onPick({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    }
  };

  return (
    <View style={styles.fileWrap}>
      <AppText variant="label" style={styles.fileLabel}>
        {label}
      </AppText>
      <View style={[styles.fileBox, !!error && styles.fileError]}>
        <Ionicons name="document-attach-outline" size={20} color={palette.primary} />
        <AppText numberOfLines={1} tone={file ? 'default' : 'muted'} style={styles.fileName}>
          {file?.name ?? 'No file chosen'}
        </AppText>
        <Button title={file ? 'Change' : 'Choose'} size="sm" variant="secondary" block={false} onPress={choose} />
      </View>
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.kv}>
      <AppText tone="muted" style={styles.kvLabel}>
        {label}
      </AppText>
      <View style={styles.kvValue}>{typeof value === 'string' || typeof value === 'number' ? <AppText weight="medium">{value}</AppText> : value}</View>
    </View>
  );
}

const badgeTones: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: palette.border, text: palette.text },
  success: { background: '#DDF3E8', text: palette.success },
  danger: { background: palette.dangerSoft, text: palette.danger },
  warning: { background: '#FBF1D6', text: '#9A6B00' },
  info: { background: palette.accentSoft, text: palette.accent },
};

const styles = StyleSheet.create({
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm },
  switchText: { flex: 1 },
  fileWrap: { marginBottom: spacing.md },
  fileLabel: { marginBottom: spacing.xs },
  fileBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: spacing.sm, backgroundColor: palette.surface },
  fileError: { borderColor: palette.danger },
  fileName: { flex: 1 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
  kvLabel: { flexShrink: 0 },
  kvValue: { flex: 1, alignItems: 'flex-end' },
});
