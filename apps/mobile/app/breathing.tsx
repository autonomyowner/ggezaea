import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../stores/userStore';

type BreathingPattern = {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
};

const PATTERNS: BreathingPattern[] = [
  {
    name: 'هدوء',
    description: 'تنفس استرخائي بسيط',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 5,
  },
  {
    name: 'صندوق',
    description: 'تقنية عسكرية لتخفيف التوتر',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4,
  },
  {
    name: '4-7-8',
    description: 'للنوم العميق وتخفيف القلق',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
  },
];

type Phase = 'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'complete';

export default function BreathingScreen() {
  const router = useRouter();
  const { incrementBreathingSessions } = useUserStore();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(PATTERNS[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'استنشق';
      case 'hold1': return 'احبس';
      case 'exhale': return 'ازفر';
      case 'hold2': return 'احبس';
      case 'complete': return 'أحسنت';
      default: return 'جاهز؟';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return '#5a9470';
      case 'hold1': return '#c97d52';
      case 'exhale': return '#6b9ac4';
      case 'hold2': return '#c97d52';
      default: return '#5a9470';
    }
  };

  const animateBreath = (toScale: number, duration: number) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: toScale,
        duration: duration * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: toScale > 1 ? 0.8 : 0.5,
        duration: duration * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runPhase = async (phaseName: Phase, duration: number, scale: number) => {
    if (duration === 0) return;

    setPhase(phaseName);
    setCountdown(duration);
    animateBreath(scale, duration);

    // Haptic feedback at start of phase
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    for (let i = duration; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
  };

  const startBreathing = async () => {
    setIsActive(true);
    setCurrentCycle(0);

    for (let cycle = 0; cycle < selectedPattern.cycles; cycle++) {
      setCurrentCycle(cycle + 1);

      // Inhale
      await runPhase('inhale', selectedPattern.inhale, 1.5);

      // Hold after inhale
      if (selectedPattern.hold1 > 0) {
        await runPhase('hold1', selectedPattern.hold1, 1.5);
      }

      // Exhale
      await runPhase('exhale', selectedPattern.exhale, 1);

      // Hold after exhale
      if (selectedPattern.hold2 > 0) {
        await runPhase('hold2', selectedPattern.hold2, 1);
      }
    }

    // Complete
    setPhase('complete');
    incrementBreathingSessions();

    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 100, 100, 100]);
    }
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('idle');
    setCurrentCycle(0);
    setCountdown(0);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.6);
  };

  const resetSession = () => {
    stopBreathing();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fefdfb' }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#2d3a2e" />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#2d3a2e', marginLeft: 8 }}>
          التنفس
        </Text>
      </View>

      {/* Pattern Selection */}
      {!isActive && phase !== 'complete' && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ color: '#5a5347', marginBottom: 12, fontWeight: '500' }}>اختر نمطاً:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PATTERNS.map((pattern) => (
              <TouchableOpacity
                key={pattern.name}
                onPress={() => setSelectedPattern(pattern)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: selectedPattern.name === pattern.name ? '#5a9470' : 'white',
                  borderWidth: 1,
                  borderColor: selectedPattern.name === pattern.name ? '#5a9470' : '#f5ebe0',
                }}
              >
                <Text style={{
                  fontWeight: '600',
                  color: selectedPattern.name === pattern.name ? 'white' : '#2d3a2e',
                  textAlign: 'center',
                }}>
                  {pattern.name}
                </Text>
                <Text style={{
                  fontSize: 11,
                  color: selectedPattern.name === pattern.name ? 'rgba(255,255,255,0.8)' : '#a69889',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  {pattern.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Breathing Circle */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: getPhaseColor(),
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isActive && countdown > 0 ? (
              <Text style={{ fontSize: 48, fontWeight: '700', color: getPhaseColor() }}>
                {countdown}
              </Text>
            ) : (
              <Ionicons
                name={phase === 'complete' ? 'checkmark-circle' : 'leaf'}
                size={48}
                color={getPhaseColor()}
              />
            )}
          </View>
        </Animated.View>

        {/* Phase Text */}
        <Text style={{
          fontSize: 28,
          fontWeight: '600',
          color: '#2d3a2e',
          marginTop: 32,
        }}>
          {getPhaseText()}
        </Text>

        {/* Cycle Counter */}
        {isActive && (
          <Text style={{ color: '#a69889', marginTop: 8 }}>
            الدورة {currentCycle} من {selectedPattern.cycles}
          </Text>
        )}

        {/* Pattern Info */}
        {!isActive && phase !== 'complete' && (
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#a69889', fontSize: 14 }}>
              {selectedPattern.inhale}ث استنشاق
              {selectedPattern.hold1 > 0 && ` • ${selectedPattern.hold1}ث حبس`}
              {` • ${selectedPattern.exhale}ث زفير`}
              {selectedPattern.hold2 > 0 && ` • ${selectedPattern.hold2}ث حبس`}
            </Text>
            <Text style={{ color: '#a69889', fontSize: 14, marginTop: 4 }}>
              {selectedPattern.cycles} دورات
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={{ padding: 16, paddingBottom: 32 }}>
        {phase === 'complete' ? (
          <View style={{ gap: 12 }}>
            <View style={{ backgroundColor: '#dcedde', borderRadius: 12, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: '#3d654c', fontWeight: '600', fontSize: 16 }}>
                اكتملت الجلسة
              </Text>
              <Text style={{ color: '#5a9470', marginTop: 4 }}>
                أحسنت في تخصيص وقت لنفسك
              </Text>
            </View>
            <TouchableOpacity
              onPress={resetSession}
              style={{
                backgroundColor: '#5a9470',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                ابدأ جلسة أخرى
              </Text>
            </TouchableOpacity>
          </View>
        ) : isActive ? (
          <TouchableOpacity
            onPress={stopBreathing}
            style={{
              backgroundColor: '#f5ebe0',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#5a5347', fontWeight: '600', fontSize: 16 }}>
              إيقاف
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={startBreathing}
            style={{
              backgroundColor: '#5a9470',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              ابدأ
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
