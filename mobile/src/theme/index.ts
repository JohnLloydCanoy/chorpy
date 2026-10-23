/**
 * Chorpy Design System & Global Theme Tokens
 * Edit colors, spacing, and typography here to uniformly update the whole app.
 */

export const colors = {
  // Brand Identity (Sky Blue + Coral Orange)
  primary: '#0284C7',        // Sky Blue (Headers, active buttons, focus)
  primaryLight: '#38BDF8',   // Lighter Sky Blue (Hover, active badges)
  primarySoft: '#F0F9FF',    // Background tint
  primaryDark: '#0369A1',

  accent: '#FF6B4A',         // Bright Coral Orange (Call-to-actions, locks, highlights)
  accentHover: '#EA580C',
  accentSoft: '#FFF7ED',

  // Status & Feedback Colors
  success: '#16A34A',        // Green (Approved, unlocked, complete)
  successSoft: '#F0FDF4',
  successBorder: '#BBF7D0',

  warning: '#F59E0B',        // Amber (Pending review, caution)
  warningSoft: '#FEF3C7',

  danger: '#DC2626',         // Red (Locked, rejected, destructive)
  dangerSoft: '#FEF2F2',
  dangerBorder: '#FECACA',

  // Neutrals & Surfaces
  background: '#F8FAFC',     // Cloud White (Main app background)
  surface: '#FFFFFF',        // Pure White (Cards, modals, forms)
  surfaceDark: '#0F172A',    // Slate Navy (Child Lock Screen background)
  surfaceCardDark: '#1E293B',// Dark Card background

  // Borders & Dividers
  border: '#E2E8F0',         // Soft border
  borderDark: '#334155',     // Dark mode border

  // Typography Colors
  text: '#0F172A',           // Primary dark text (Headings)
  textSecondary: '#64748B',  // Slate gray (Subtitles, descriptions)
  textMuted: '#94A3B8',      // Light gray (Placeholders, hints)
  textLight: '#FFFFFF',      // White text for dark surfaces
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};
