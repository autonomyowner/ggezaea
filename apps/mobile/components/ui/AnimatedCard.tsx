import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { platformStyles, cardStyles } from './platformStyles';
import { useHaptics } from './useHaptics';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  delay?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 350,
  mass: 0.9,
};

export function AnimatedCard({
  children,
  style,
  onPress,
  elevated = false,
  delay = 0,
  accessibilityLabel,
  accessibilityHint,
}: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(
      pressed.value,
      [0, 1],
      [1, 0.98],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: withSpring(scaleValue, SPRING_CONFIG) }],
    };
  });

  const gesture = onPress
    ? Gesture.Tap()
        .onBegin(() => {
          pressed.value = 1;
        })
        .onFinalize((e, success) => {
          pressed.value = 0;
          if (success) {
            haptics.light();
          }
        })
        .onEnd(() => {
          if (onPress) {
            onPress();
          }
        })
    : undefined;

  const CardContent = (
    <Animated.View
      style={[
        elevated ? cardStyles.elevated : cardStyles.base,
        style,
        animatedStyle,
      ]}
      accessible={!!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </Animated.View>
  );

  if (gesture) {
    return <GestureDetector gesture={gesture}>{CardContent}</GestureDetector>;
  }

  return CardContent;
}

// Simple static card without animation
export function Card({
  children,
  style,
  elevated = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  return (
    <View style={[elevated ? cardStyles.elevated : cardStyles.base, style]}>
      {children}
    </View>
  );
}
