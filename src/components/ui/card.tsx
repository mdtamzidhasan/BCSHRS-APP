import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, shadow, spacing } from '@/theme/tokens';

import { AppText } from './app-text';

interface Props {
  title?: string;
  /** The teal outline of the report cards in the design. */
  outlined?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ title, outlined, children, style }: Props) {
  return (
    <View style={[styles.card, outlined && styles.outlined, style]}>
      {title ? (
        <AppText variant="subheading" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  outlined: { borderWidth: 1.5, borderColor: palette.primaryBorder },
  title: { marginBottom: spacing.md },
});
