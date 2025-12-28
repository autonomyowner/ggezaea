import { Platform, StyleSheet } from 'react-native';

// Platform-specific design tokens
export const platformStyles = {
  // Shadows optimized for each platform
  shadow: {
    small: Platform.select({
      ios: {
        shadowColor: '#2d3a2e',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#2d3a2e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
    large: Platform.select({
      ios: {
        shadowColor: '#2d3a2e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },

  // Border radius - iOS prefers slightly more rounded
  borderRadius: {
    sm: Platform.OS === 'ios' ? 8 : 6,
    md: Platform.OS === 'ios' ? 14 : 12,
    lg: Platform.OS === 'ios' ? 20 : 16,
    xl: Platform.OS === 'ios' ? 28 : 24,
    full: 9999,
  },

  // Touch target sizes - Android needs larger
  touchTarget: {
    min: Platform.OS === 'android' ? 48 : 44,
    comfortable: Platform.OS === 'android' ? 56 : 48,
  },

  // Animation durations - iOS can be slightly faster
  animation: {
    fast: Platform.OS === 'ios' ? 150 : 180,
    normal: Platform.OS === 'ios' ? 250 : 300,
    slow: Platform.OS === 'ios' ? 400 : 450,
  },

  // Safe area handling
  safeArea: {
    // Extra padding for notch devices
    topPadding: Platform.OS === 'ios' ? 0 : 8,
  },

  // Typography adjustments
  font: {
    // Android needs slightly more letter spacing
    letterSpacing: Platform.OS === 'android' ? 0.25 : 0,
    // Line height multiplier
    lineHeightMultiplier: Platform.OS === 'android' ? 1.3 : 1.2,
  },
};

// Common card styles
export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: 'white',
    borderRadius: platformStyles.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#f5ebe0',
    ...platformStyles.shadow.small,
  },
  elevated: {
    backgroundColor: 'white',
    borderRadius: platformStyles.borderRadius.lg,
    ...platformStyles.shadow.medium,
  },
});

// Common button styles
export const buttonStyles = StyleSheet.create({
  base: {
    minHeight: platformStyles.touchTarget.min,
    borderRadius: platformStyles.borderRadius.md,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  primary: {
    backgroundColor: '#5a9470',
  },
  secondary: {
    backgroundColor: '#dcedde',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5a9470',
  },
});
