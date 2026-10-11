import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, spacing } from '@/theme/tokens';

interface Props {
  children: React.ReactNode;
  /** Plain (non-scrolling) body, for screens that hold their own list. */
  fixed?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Safe-area edges to pad; headers/tab bars already cover top/bottom. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentStyle?: StyleProp<ViewStyle>;
}

/** The base of every screen: lavender background, safe area, vertical scroll with optional pull-to-refresh. */
export function Screen({ children, fixed, refreshing, onRefresh, edges = ['left', 'right'], contentStyle }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {fixed ? (
        <View style={[styles.content, styles.fixed, contentStyle]}>{children}</View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, contentStyle]}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={palette.primary} colors={[palette.primary]} /> : undefined}>
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  fixed: { flex: 1 },
});
