export const colors = {
  background: '#0a0a0a', // Deep dark
  surface: '#171717',
  surfaceHighlight: '#262626',
  text: '#f5f5f5',
  textMuted: '#a3a3a3',
  primary: '#e5e5e5', // High contrast white/gray for primary actions
  accent: '#3b82f6', // Subtle blue for links or specific highlights
  danger: '#ef4444',
  pressureColors: {
    1: '#3b82f6', // Calm (Blue)
    2: '#8b5cf6', // Resistant (Purple)
    3: '#f59e0b', // Defensive (Amber)
    4: '#ef4444', // Hostile (Red)
    5: '#7f1d1d', // Brutal (Dark Red)
  }
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text, lineHeight: 24 },
  bodyMuted: { fontSize: 16, fontWeight: '400', color: colors.textMuted, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
