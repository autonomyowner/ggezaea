import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';

interface VoiceOrbProps {
  isActive: boolean;
  volumeLevel: number;
  size?: number;
}

export function VoiceOrb({ isActive, volumeLevel, size = 180 }: VoiceOrbProps) {
  const pulseProgress = useSharedValue(0);
  const volumeScale = useSharedValue(1);

  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      pulseProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseProgress.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, pulseProgress]);

  // Volume-based scaling
  useEffect(() => {
    const targetScale = 1 + volumeLevel * 0.3;
    volumeScale.value = withTiming(targetScale, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  }, [volumeLevel, volumeScale]);

  // Outer pulse ring animation
  const outerRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseProgress.value, [0, 1], [1, 1.15]);
    const opacity = interpolate(pulseProgress.value, [0, 1], [0.4, 0.2]);

    return {
      transform: [{ scale: scale * volumeScale.value }],
      opacity,
    };
  });

  // Middle pulse ring animation
  const middleRingStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseProgress.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(pulseProgress.value, [0, 1], [0.5, 0.3]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Core responds to volume
  const coreStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: volumeScale.value }],
    };
  });

  const coreSize = size * 0.67; // 120/180 ratio from web
  const ringOffset = size * 0.055; // -10px on 180px

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.ring,
          outerRingStyle,
          {
            position: 'absolute',
            top: -ringOffset,
            left: -ringOffset,
            right: -ringOffset,
            bottom: -ringOffset,
            borderRadius: (size + ringOffset * 2) / 2,
          },
        ]}
      />

      {/* Middle pulse ring */}
      <Animated.View
        style={[
          styles.ring,
          middleRingStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: size / 2,
          },
        ]}
      />

      {/* Core with mic */}
      <Animated.View
        style={[
          styles.core,
          coreStyle,
          {
            width: coreSize,
            height: coreSize,
            borderRadius: coreSize / 2,
          },
        ]}
      >
        {/* Mic icon as simple shapes */}
        <View style={styles.micContainer}>
          <View style={styles.micBody} />
          <View style={styles.micBase} />
          <View style={styles.micStand} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    backgroundColor: colors.matcha[400],
  },
  core: {
    backgroundColor: colors.matcha[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.matcha[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  micContainer: {
    alignItems: 'center',
  },
  micBody: {
    width: 20,
    height: 28,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  micBase: {
    width: 32,
    height: 16,
    borderWidth: 3,
    borderColor: 'white',
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -4,
  },
  micStand: {
    width: 3,
    height: 8,
    backgroundColor: 'white',
    marginTop: -1,
  },
});

export default VoiceOrb;
