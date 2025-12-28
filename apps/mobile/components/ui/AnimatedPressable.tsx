import React, { useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  AccessibilityRole,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useHaptics } from './useHaptics';
import { platformStyles, buttonStyles } from './platformStyles';

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

// Spring config for natural feel
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 400,
  mass: 0.8,
};

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  activeScale?: number;
  activeOpacity?: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AnimatedPressable({
  children,
  style,
  activeScale = 0.97,
  activeOpacity = 0.9,
  hapticFeedback = 'light',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: AnimatedPressableProps) {
  const pressed = useSharedValue(0);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressed.value,
      [0, 1],
      [1, activeScale],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      pressed.value,
      [0, 1],
      [1, activeOpacity],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: withSpring(scale, SPRING_CONFIG) }],
      opacity: withTiming(opacity, { duration: platformStyles.animation.fast }),
    };
  });

  const handlePressIn = useCallback(
    (e: any) => {
      pressed.value = 1;
      if (hapticFeedback !== 'none') {
        haptics[hapticFeedback]?.();
      }
      onPressIn?.(e);
    },
    [hapticFeedback, haptics, onPressIn, pressed]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      pressed.value = 0;
      onPressOut?.(e);
    },
    [onPressOut, pressed]
  );

  return (
    <AnimatedPressableComponent
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[animatedStyle, style, disabled && styles.disabled]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}

// Button variants
interface ButtonProps extends Omit<AnimatedPressableProps, 'children'> {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PrimaryButton({
  title,
  loading,
  fullWidth,
  size = 'md',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      style={[
        buttonStyles.base,
        buttonStyles.primary,
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      hapticFeedback="medium"
      accessibilityLabel={loading ? `${title}, loading` : title}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          styles.primaryText,
          sizeStyles.text,
          (disabled || loading) && styles.disabledText,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedPressable>
  );
}

export function SecondaryButton({
  title,
  loading,
  fullWidth,
  size = 'md',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      style={[
        buttonStyles.base,
        buttonStyles.secondary,
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      hapticFeedback="light"
      accessibilityLabel={loading ? `${title}, loading` : title}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          styles.secondaryText,
          sizeStyles.text,
          (disabled || loading) && styles.disabledText,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedPressable>
  );
}

export function GhostButton({
  title,
  loading,
  fullWidth,
  size = 'md',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = SIZE_STYLES[size];

  return (
    <AnimatedPressable
      style={[
        buttonStyles.base,
        buttonStyles.ghost,
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      hapticFeedback="light"
      activeScale={0.98}
      accessibilityLabel={loading ? `${title}, loading` : title}
      {...props}
    >
      <Text
        style={[
          styles.buttonText,
          styles.ghostText,
          sizeStyles.text,
          (disabled || loading) && styles.disabledText,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedPressable>
  );
}

const SIZE_STYLES = {
  sm: StyleSheet.create({
    button: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      minHeight: 36,
    },
    text: {
      fontSize: 14,
    },
  }),
  md: StyleSheet.create({
    button: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      minHeight: platformStyles.touchTarget.min,
    },
    text: {
      fontSize: 16,
    },
  }),
  lg: StyleSheet.create({
    button: {
      paddingVertical: 18,
      paddingHorizontal: 28,
      minHeight: platformStyles.touchTarget.comfortable,
    },
    text: {
      fontSize: 18,
    },
  }),
};

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    letterSpacing: platformStyles.font.letterSpacing,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#3d654c',
  },
  ghostText: {
    color: '#5a9470',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
});
