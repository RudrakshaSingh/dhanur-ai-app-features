// Dhanur AI Theme Configuration

export const COLORS = {
  // Primary Colors
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B83FF',
  
  // Accent Colors
  accent: '#00D9FF',
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF5252',
  
  // Background Colors
  background: '#0A0A0F',
  backgroundLight: '#1A1A2E',
  surface: '#16213E',
  surfaceLight: '#1F2B47',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8D1',
  textMuted: '#6C7293',
  
  // Gradient Colors
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export const GRADIENTS = {
  primary: ['#667eea', '#764ba2'],
  accent: ['#00D9FF', '#6C63FF'],
  dark: ['#0A0A0F', '#1A1A2E'],
  surface: ['#16213E', '#1F2B47'],
  success: ['#00E676', '#00C853'],
  recording: ['#FF5252', '#FF1744'],
};

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

export default {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
};
