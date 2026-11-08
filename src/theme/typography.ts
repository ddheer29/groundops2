import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  h1: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h2: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h3: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  h4: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  caption: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  button: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  badge: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
};
