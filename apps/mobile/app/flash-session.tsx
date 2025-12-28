import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { createApiClient } from '../lib/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type SessionState = 'INTRO' | 'SET_ACTIVE' | 'SET_PAUSE' | 'CLOSING' | 'SUMMARY';

// Stress Level Slider Component
function StressSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="w-full">
      <View className="flex-row justify-between mb-2">
        <Text className="text-matcha-600 text-sm">0 - Relaxed</Text>
        <Text className="text-terra-500 text-sm">10 - Very Stressed</Text>
      </View>
      <View className="h-4 bg-warm-200 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${value * 10}%`,
            backgroundColor:
              value <= 3 ? '#8fc49a' : value <= 6 ? '#e8d9c5' : '#c97d52',
          }}
        />
      </View>
      <View className="flex-row mt-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            className={`flex-1 py-2 items-center ${value === num ? 'bg-matcha-100 rounded' : ''}`}
            onPress={() => onChange(num)}
          >
            <Text
              className={`text-sm ${
                value === num ? 'text-matcha-700 font-sans-semibold' : 'text-warm-500'
              }`}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Bilateral Circles Component
function BilateralCircles({ activeSide }: { activeSide: 'left' | 'right' }) {
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);
  const leftOpacity = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (activeSide === 'left') {
      leftScale.value = withTiming(1.2, { duration: 200 });
      leftOpacity.value = withTiming(1, { duration: 200 });
      rightScale.value = withTiming(1, { duration: 200 });
      rightOpacity.value = withTiming(0.5, { duration: 200 });
    } else {
      rightScale.value = withTiming(1.2, { duration: 200 });
      rightOpacity.value = withTiming(1, { duration: 200 });
      leftScale.value = withTiming(1, { duration: 200 });
      leftOpacity.value = withTiming(0.5, { duration: 200 });
    }
  }, [activeSide]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
    opacity: leftOpacity.value,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: rightOpacity.value,
  }));

  return (
    <View className="flex-row justify-around items-center w-full px-8">
      <View className="items-center">
        <Animated.View
          style={[leftStyle]}
          className="w-32 h-32 rounded-full bg-matcha-500 items-center justify-center"
        >
          <Text className="text-white font-sans-semibold text-lg">Left</Text>
        </Animated.View>
      </View>
      <View className="items-center">
        <Animated.View
          style={[rightStyle]}
          className="w-32 h-32 rounded-full bg-matcha-500 items-center justify-center"
        >
          <Text className="text-white font-sans-semibold text-lg">Right</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// Blink Overlay Component
function BlinkOverlay({
  isVisible,
  blinkCount,
}: {
  isVisible: boolean;
  blinkCount: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      );
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(3, { duration: 500, easing: Easing.out(Easing.ease) })
      );
    }
  }, [isVisible, blinkCount]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[overlayStyle]}
      className="absolute inset-0 bg-matcha-900/80 items-center justify-center"
    >
      <Animated.View
        style={[rippleStyle]}
        className="w-40 h-40 rounded-full bg-matcha-400/30"
      />
      <View className="absolute items-center">
        <Text className="text-white font-serif text-4xl mb-2">REFOCUS</Text>
        <Text className="text-matcha-200 text-xl">{blinkCount}</Text>
      </View>
    </Animated.View>
  );
}

// Speaking Indicator Component
function SpeakingIndicator({ isActive }: { isActive: boolean }) {
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.3);

  useEffect(() => {
    if (isActive) {
      bar1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1
      );
      bar2.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      );
      bar3.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1
      );
    } else {
      bar1.value = withTiming(0.3);
      bar2.value = withTiming(0.3);
      bar3.value = withTiming(0.3);
    }
  }, [isActive]);

  const bar1Style = useAnimatedStyle(() => ({
    height: bar1.value * 24,
  }));
  const bar2Style = useAnimatedStyle(() => ({
    height: bar2.value * 24,
  }));
  const bar3Style = useAnimatedStyle(() => ({
    height: bar3.value * 24,
  }));

  if (!isActive) return null;

  return (
    <View className="flex-row items-end gap-1 h-6">
      <Animated.View style={[bar1Style]} className="w-1 bg-matcha-400 rounded-full" />
      <Animated.View style={[bar2Style]} className="w-1 bg-matcha-400 rounded-full" />
      <Animated.View style={[bar3Style]} className="w-1 bg-matcha-400 rounded-full" />
    </View>
  );
}

export default function FlashSessionScreen() {
  const router = useRouter();

  const [state, setState] = useState<SessionState>('INTRO');
  const [topic, setTopic] = useState('');
  const [positiveMemory, setPositiveMemory] = useState('');
  const [stressStart, setStressStart] = useState(5);
  const [stressEnd, setStressEnd] = useState(5);
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [showBlink, setShowBlink] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const bilateralInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bilateralInterval.current) clearInterval(bilateralInterval.current);
      if (blinkInterval.current) clearInterval(blinkInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const startSession = async () => {
    try {
      const api = createApiClient();
      const response = await api.startEmdrSession();
      setConversationId(response.data.conversationId);

      // Send initial context
      await api.sendEmdrMessage(
        response.data.conversationId,
        `Focus: ${topic}. Positive thought: ${positiveMemory}. Starting stress level: ${stressStart}/10`
      );

      setState('SET_ACTIVE');
      startBilateral();
    } catch (err) {
      console.error('Failed to start session:', err);
      // Start locally even if API fails
      setState('SET_ACTIVE');
      startBilateral();
    }
  };

  const startBilateral = useCallback(() => {
    // Start bilateral stimulation (2.5 second intervals)
    bilateralInterval.current = setInterval(() => {
      setActiveSide((prev) => (prev === 'left' ? 'right' : 'left'));
      Vibration.vibrate(50); // Haptic feedback
    }, 2500);

    // Start blink sequence (every 15-20 seconds)
    const scheduleBlink = () => {
      const delay = 15000 + Math.random() * 5000;
      blinkInterval.current = setTimeout(() => {
        triggerBlink();
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();

    // Start timer
    timerInterval.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const triggerBlink = useCallback(() => {
    setShowBlink(true);
    setBlinkCount((prev) => prev + 1);
    Vibration.vibrate([100, 100, 100]); // Triple vibration
    setTimeout(() => setShowBlink(false), 500);
  }, []);

  const pauseSession = () => {
    if (bilateralInterval.current) clearInterval(bilateralInterval.current);
    if (blinkInterval.current) clearTimeout(blinkInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    setSetsCompleted((prev) => prev + 1);
    setState('SET_PAUSE');
  };

  const resumeSession = () => {
    setState('SET_ACTIVE');
    startBilateral();
  };

  const endSession = () => {
    if (bilateralInterval.current) clearInterval(bilateralInterval.current);
    if (blinkInterval.current) clearTimeout(blinkInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    setState('CLOSING');
  };

  const completeSession = async () => {
    if (conversationId) {
      try {
        const api = createApiClient();
        await api.completeEmdrSession(conversationId, stressEnd);
      } catch (err) {
        console.error('Failed to complete session:', err);
      }
    }
    setState('SUMMARY');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // INTRO Screen
  if (state === 'INTRO') {
    return (
      <SafeAreaView className="flex-1 bg-cream-50">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#5a5347" />
            </TouchableOpacity>
            <Text className="font-serif text-2xl text-warm-900">Focus Exercise</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Topic Input */}
          <View className="mb-6">
            <Text className="text-warm-900 font-sans-semibold mb-2">
              What would you like to focus on?
            </Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-900"
              placeholder="A thought or feeling you want to process..."
              placeholderTextColor="#a69889"
              value={topic}
              onChangeText={setTopic}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Stress Slider */}
          <View className="mb-6">
            <Text className="text-warm-900 font-sans-semibold mb-4">
              Current stress level (0-10)
            </Text>
            <StressSlider value={stressStart} onChange={setStressStart} />
          </View>

          {/* Positive Memory */}
          <View className="mb-6">
            <Text className="text-warm-900 font-sans-semibold mb-2">
              Think of a calming, happy thought
            </Text>
            <TextInput
              className="bg-white border border-warm-200 rounded-xl px-4 py-3 text-warm-900"
              placeholder="A peaceful place, happy moment..."
              placeholderTextColor="#a69889"
              value={positiveMemory}
              onChangeText={setPositiveMemory}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Instructions */}
          <View className="bg-matcha-50 rounded-xl p-4 mb-8">
            <Text className="text-matcha-800 font-sans-semibold mb-2">How it works:</Text>
            <Text className="text-matcha-700 mb-1">
              1. Focus on the alternating circles
            </Text>
            <Text className="text-matcha-700 mb-1">
              2. When prompted, blink and refocus
            </Text>
            <Text className="text-matcha-700 mb-1">
              3. Hold your positive thought in mind
            </Text>
            <Text className="text-matcha-700">
              4. Take breaks when needed
            </Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl ${
              topic.trim() && positiveMemory.trim()
                ? 'bg-matcha-600'
                : 'bg-warm-300'
            }`}
            onPress={startSession}
            disabled={!topic.trim() || !positiveMemory.trim()}
          >
            <Text
              className={`text-center font-sans-semibold text-lg ${
                topic.trim() && positiveMemory.trim()
                  ? 'text-white'
                  : 'text-warm-500'
              }`}
            >
              Begin Session
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SET_ACTIVE Screen (Immersive)
  if (state === 'SET_ACTIVE') {
    return (
      <View className="flex-1 bg-warm-900">
        <SafeAreaView className="flex-1">
          {/* Timer */}
          <View className="items-center pt-8">
            <Text className="text-warm-400 text-sm">Session Time</Text>
            <Text className="text-white font-sans-bold text-3xl">
              {formatTime(elapsedTime)}
            </Text>
          </View>

          {/* Bilateral Circles */}
          <View className="flex-1 items-center justify-center">
            <BilateralCircles activeSide={activeSide} />
            <SpeakingIndicator isActive={isSpeaking} />
          </View>

          {/* Progress */}
          <View className="px-8 pb-4">
            <View className="h-1 bg-warm-700 rounded-full">
              <View
                className="h-full bg-matcha-500 rounded-full"
                style={{ width: `${Math.min((elapsedTime / 300) * 100, 100)}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-warm-500 text-sm">
                Blinks: {blinkCount}
              </Text>
              <Text className="text-warm-500 text-sm">
                Sets: {setsCompleted}
              </Text>
            </View>
          </View>

          {/* Stop Button */}
          <View className="px-8 pb-8">
            <TouchableOpacity
              className="py-4 rounded-xl bg-terra-500"
              onPress={pauseSession}
            >
              <Text className="text-white text-center font-sans-semibold">
                I need to stop
              </Text>
            </TouchableOpacity>
          </View>

          {/* Blink Overlay */}
          <BlinkOverlay isVisible={showBlink} blinkCount={blinkCount} />
        </SafeAreaView>
      </View>
    );
  }

  // SET_PAUSE Screen
  if (state === 'SET_PAUSE') {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 items-center justify-center px-8">
        <Ionicons name="pause-circle-outline" size={80} color="#5a9470" />
        <Text className="font-serif text-3xl text-warm-900 mt-6 text-center">
          Take a breath
        </Text>
        <Text className="text-warm-600 mt-2 text-center">
          Set {setsCompleted} complete
        </Text>
        <Text className="text-warm-500 mt-4 text-center">
          How are you feeling? Take a moment to notice any changes.
        </Text>

        <View className="w-full mt-8 gap-3">
          <TouchableOpacity
            className="py-4 rounded-xl bg-matcha-600"
            onPress={resumeSession}
          >
            <Text className="text-white text-center font-sans-semibold">
              Continue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-4 rounded-xl bg-warm-200"
            onPress={endSession}
          >
            <Text className="text-warm-700 text-center font-sans-semibold">
              End Session
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // CLOSING Screen
  if (state === 'CLOSING') {
    return (
      <SafeAreaView className="flex-1 bg-cream-50 px-8">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Text className="font-serif text-2xl text-warm-900 text-center mb-2">
            How do you feel?
          </Text>
          <Text className="text-warm-600 text-center mb-8">
            "{topic}"
          </Text>

          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-warm-900 font-sans-semibold mb-4 text-center">
              Current stress level (0-10)
            </Text>
            <StressSlider value={stressEnd} onChange={setStressEnd} />
          </View>

          <View className="flex-row justify-center gap-6 mb-8">
            <View className="items-center">
              <Text className="text-warm-500 text-sm">Before</Text>
              <Text className="text-2xl font-sans-bold text-terra-500">
                {stressStart}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#d9d0c5" />
            <View className="items-center">
              <Text className="text-warm-500 text-sm">After</Text>
              <Text className="text-2xl font-sans-bold text-matcha-600">
                {stressEnd}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="py-4 rounded-xl bg-matcha-600"
            onPress={completeSession}
          >
            <Text className="text-white text-center font-sans-semibold text-lg">
              Complete Session
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // SUMMARY Screen
  if (state === 'SUMMARY') {
    const stressChange = stressStart - stressEnd;

    return (
      <SafeAreaView className="flex-1 bg-cream-50 px-8">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-matcha-100 items-center justify-center mb-4">
              <Ionicons name="checkmark" size={40} color="#5a9470" />
            </View>
            <Text className="font-serif text-3xl text-warm-900">
              Exercise Complete
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-warm-500 text-sm">Stress</Text>
              <Text
                className={`text-2xl font-sans-bold ${
                  stressChange > 0 ? 'text-matcha-600' : 'text-terra-500'
                }`}
              >
                {stressChange > 0 ? '-' : '+'}
                {Math.abs(stressChange)}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-warm-500 text-sm">Duration</Text>
              <Text className="text-2xl font-sans-bold text-warm-900">
                {formatTime(elapsedTime)}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl p-4 items-center">
              <Text className="text-warm-500 text-sm">Sets</Text>
              <Text className="text-2xl font-sans-bold text-warm-900">
                {setsCompleted}
              </Text>
            </View>
          </View>

          <View className="bg-matcha-50 rounded-xl p-4 mb-8">
            <Text className="text-matcha-700 text-center">
              Great job taking time for yourself. Regular practice can help you feel more relaxed.
            </Text>
          </View>

          <TouchableOpacity
            className="py-4 rounded-xl bg-matcha-600"
            onPress={() => router.back()}
          >
            <Text className="text-white text-center font-sans-semibold text-lg">
              Done
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}
