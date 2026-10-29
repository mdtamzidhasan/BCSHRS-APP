import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';

import { TextField } from './text-field';
import { ViewToggle, type ViewMode } from './view-toggle';

interface Props {
  search: string;
  onSearch: (text: string) => void;
  label?: string;
  placeholder?: string;
  mode: ViewMode;
  onMode: (mode: ViewMode) => void;
}

/** The bar above a list that can be searched and shown either as cards or as a table: search box + Card | Table switch. */
export function ListToolbar({ search, onSearch, label = 'Search', placeholder, mode, onMode }: Props) {
  return (
    <View style={styles.wrap}>
      <TextField label={label} value={search} onChangeText={onSearch} placeholder={placeholder} autoCorrect={false} returnKeyType="search" />
      <ViewToggle value={mode} onChange={onMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginBottom: spacing.md },
});
