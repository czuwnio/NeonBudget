import { Platform } from 'react-native';

const fontName = Platform.OS === 'web' ? '"Outfit", system-ui, sans-serif' : undefined;

export const theme = {
  colors: {
    background: '#05050A',
    surfaceDark: 'rgba(20, 20, 30, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    neonPurple: '#9D4EDD',
    neonPurpleLight: '#C77DFF',
    neonGreen: '#38B000',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B0',
    danger: '#FF4D4D',
  },
  typography: {
    fontFamily: fontName,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }
};
