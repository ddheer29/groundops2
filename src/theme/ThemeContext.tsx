import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { appStorage } from '../storage/mmkv';

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = '@groundops_theme_mode';

interface ThemeContextType {
  mode: 'light' | 'dark';
  themeSetting: ThemeMode;
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
  setThemeSetting: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null | undefined

  // Read saved preference synchronously on app initialization (defaults to 'light')
  const [themeSetting, setThemeSettingState] = useState<ThemeMode>(() => {
    const saved = appStorage.getString(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'light'; // Default is light
  });

  // Dynamically resolve visual mode based on setting and system appearance
  const mode: 'light' | 'dark' = useMemo(() => {
    if (themeSetting === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeSetting;
  }, [themeSetting, systemColorScheme]);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const setThemeSetting = useCallback((newSetting: ThemeMode) => {
    setThemeSettingState(newSetting);
    appStorage.set(THEME_STORAGE_KEY, newSetting);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeSettingState(prev => {
      const nextSetting: ThemeMode = prev === 'light' ? 'dark' : 'light';
      appStorage.set(THEME_STORAGE_KEY, nextSetting);
      return nextSetting;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      themeSetting,
      colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      isDark,
      setThemeSetting,
      toggleTheme,
    }),
    [mode, themeSetting, colors, isDark, setThemeSetting, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
