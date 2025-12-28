import React, { useEffect, Children, cloneElement, isValidElement } from 'react';
import { ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  Layout,
  ReduceMotion,
} from 'react-native-reanimated';
import { platformStyles } from './platformStyles';

// Smooth spring config
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

// Re-export Reanimated presets with custom configs
export { FadeIn, FadeInDown, FadeInUp, SlideInRight, SlideInLeft, Layout };

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Fade in animation - respects reduced motion preferences
 */
export function FadeInView({
  children,
  delay = 0,
  duration = platformStyles.animation.normal,
  style,
}: AnimationProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [delay, duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

/**
 * Slide up animation with fade
 */
export function SlideUp({
  children,
  delay = 0,
  duration = platformStyles.animation.normal,
  style,
}: AnimationProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, SPRING_CONFIG)
    );
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

/**
 * Scale in animation
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = platformStyles.animation.normal,
  style,
}: AnimationProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
  }, [delay, duration, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

interface StaggeredChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  style?: ViewStyle;
}

/**
 * Stagger children animations
 */
export function StaggeredChildren({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  style,
}: StaggeredChildrenProps) {
  const childArray = Children.toArray(children);

  return (
    <Animated.View style={style}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return child;

        const delay = initialDelay + index * staggerDelay;

        return (
          <SlideUp key={index} delay={delay}>
            {child}
          </SlideUp>
        );
      })}
    </Animated.View>
  );
}

/**
 * Pulse animation for attention
 */
export function Pulse({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const pulse = () => {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 200 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
    };

    const interval = setInterval(pulse, 2000);
    return () => clearInterval(interval);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

/**
 * Skeleton loading placeholder
 */
export function Skeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(0.7, { duration: 800 }, () => {
        opacity.value = withTiming(0.3, { duration: 800 }, animate);
      });
    };
    animate();
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e5ddd5',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
