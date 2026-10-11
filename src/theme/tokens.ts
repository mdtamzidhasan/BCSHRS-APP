/** Design tokens taken from the BCSHRS admin design (teal brand, indigo accent, navy wordmark). */
export const palette = {
  navy: '#1E3A8A',
  primary: '#1B8E9B',
  primaryDark: '#0F6670',
  primarySoft: '#E3F3F4',
  primaryBorder: '#9CD2D6',
  tableHeader: '#0E5A4F',
  accent: '#4C4FD6',
  accentSoft: '#E8E9FB',
  info: '#2B8FD8',
  success: '#2E9E6B',
  warning: '#E0A21A',
  danger: '#D64545',
  dangerSoft: '#FCEAEA',
  background: '#F5F5FA',
  surface: '#FFFFFF',
  text: '#1B1F2A',
  textMuted: '#667085',
  border: '#E3E5EC',
  overlay: 'rgba(15, 23, 42, 0.45)',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const font = { xs: 12, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26 } as const;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;
