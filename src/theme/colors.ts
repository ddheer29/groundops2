export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  ripple: string;
  backdrop: string;
  badgeBackground: string;
}

export const lightColors: ColorPalette = {
  primary: '#172554',        // Deep Navy
  primaryDark: '#0F172A',
  primaryLight: '#1E3A8A',
  secondary: '#2563EB',      // Blue
  accent: '#0D9488',         // Teal
  background: '#F8FAFC',     // Light Grey
  surface: '#FFFFFF',        // White
  surfaceSubtle: '#F1F5F9',  // Subtle Grey
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',    // Dark Navy
  textSecondary: '#64748B',  // Slate
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  success: '#16A34A',        // Green
  successLight: '#DCFCE7',
  warning: '#D97706',        // Amber
  warningLight: '#FEF3C7',
  danger: '#DC2626',         // Red
  dangerLight: '#FEE2E2',
  info: '#0284C7',           // Sky Blue
  infoLight: '#E0F2FE',
  ripple: 'rgba(23, 37, 84, 0.08)',
  backdrop: 'rgba(15, 23, 42, 0.5)',
  badgeBackground: '#F1F5F9',
};

export const darkColors: ColorPalette = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  secondary: '#60A5FA',
  accent: '#14B8A6',
  background: '#0B0F19',     // Deep Slate/Black
  surface: '#1E293B',        // Dark Card/Surface
  surfaceSubtle: '#334155',
  card: '#1E293B',
  border: '#334155',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',
  ripple: 'rgba(255, 255, 255, 0.08)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  badgeBackground: '#334155',
};
