import { StyleSheet, Text, type TextProps } from 'react-native';

import { font, palette } from '@/theme/tokens';

type Variant = 'title' | 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'link';
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'inverse' | 'accent';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: 'regular' | 'medium' | 'bold';
}

export function AppText({ variant = 'body', tone = 'default', weight, style, ...rest }: Props) {
  return <Text {...rest} style={[styles.base, variants[variant], tones[tone], weight && weights[weight], style]} />;
}

const styles = StyleSheet.create({
  base: { color: palette.text, fontSize: font.md },
});

const variants = StyleSheet.create({
  title: { fontSize: font.xxl, fontWeight: '700' },
  heading: { fontSize: font.xl, fontWeight: '700' },
  subheading: { fontSize: font.lg, fontWeight: '600' },
  body: { fontSize: font.md },
  label: { fontSize: font.sm, fontWeight: '600' },
  caption: { fontSize: font.xs },
  link: { fontSize: font.md, fontWeight: '600', textDecorationLine: 'underline' },
});

const tones = StyleSheet.create({
  default: { color: palette.text },
  muted: { color: palette.textMuted },
  primary: { color: palette.primary },
  danger: { color: palette.danger },
  success: { color: palette.success },
  inverse: { color: palette.white },
  accent: { color: palette.accent },
});

const weights = StyleSheet.create({
  regular: { fontWeight: '400' },
  medium: { fontWeight: '600' },
  bold: { fontWeight: '700' },
});
