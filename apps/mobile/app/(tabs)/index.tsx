import { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated as RNAnimated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useUserStore, MoodLevel } from '../../stores/userStore';
import { cancelTodayStreakWarning } from '../../lib/notifications';
import { AnimatedPressable, useHaptics } from '../../components/ui';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MOOD_OPTIONS: { level: MoodLevel; label: string; color: string; emoji: string }[] = [
  { level: 1, label: 'Struggling', color: '#e57373', emoji: '😔' },
  { level: 2, label: 'Low', color: '#ffb74d', emoji: '😕' },
  { level: 3, label: 'Okay', color: '#fff176', emoji: '😐' },
  { level: 4, label: 'Good', color: '#aed581', emoji: '🙂' },
  { level: 5, label: 'Great', color: '#81c784', emoji: '😊' },
];

// Memoized Mood Button
const MoodButton = memo(function MoodButton({
  option,
  isSelected,
  onPress,
}: {
  option: (typeof MOOD_OPTIONS)[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(isSelected ? 1.1 : 1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.1 : 1, {
      damping: 12,
      stiffness: 400,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.moodButton,
        isSelected && { backgroundColor: `${option.color}20` },
      ]}
    >
      <Animated.View
        style={[
          styles.moodCircle,
          {
            backgroundColor: option.color,
            borderWidth: isSelected ? 2 : 0,
            borderColor: '#2d3a2e',
          },
          animatedStyle,
        ]}
      >
        <Text style={styles.moodEmoji}>{option.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
});

function MoodCheckIn() {
  const { todayMood, setTodayMood } = useUserStore();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(todayMood);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const haptics = useHaptics();

  const handleMoodSelect = useCallback(
    (mood: MoodLevel) => {
      setSelectedMood(mood);
      setTodayMood(mood);
      setShowConfirmation(true);
      haptics.success();
      cancelTodayStreakWarning();
      setTimeout(() => setShowConfirmation(false), 2000);
    },
    [setTodayMood, haptics]
  );

  const selectedOption = selectedMood ? MOOD_OPTIONS[selectedMood - 1] : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      layout={Layout.springify()}
      style={styles.moodCard}
    >
      <View style={styles.moodHeader}>
        <Text style={styles.moodTitle}>How are you feeling?</Text>
        {showConfirmation && (
          <Animated.View entering={FadeInUp.springify()} style={styles.savedBadge}>
            <Text style={styles.savedLabel}>Saved</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => (
          <MoodButton
            key={option.level}
            option={option}
            isSelected={selectedMood === option.level}
            onPress={() => handleMoodSelect(option.level)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function WeekMoodStreak() {
  const { currentStreak, longestStreak, getWeekMoods } = useUserStore();
  const weekMoods = getWeekMoods();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      layout={Layout.springify()}
      style={styles.card}
    >
      <View style={styles.streakHeader}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <View style={styles.weekDays}>
        {last7Days.map((date, index) => {
          const moodEntry = weekMoods.find((m) => m.date === date);
          const isToday = date === new Date().toISOString().split('T')[0];
          const moodOption = moodEntry ? MOOD_OPTIONS[moodEntry.mood - 1] : null;

          return (
            <View key={date} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayDot,
                  moodOption && { backgroundColor: moodOption.color },
                  isToday && styles.dayDotToday,
                ]}
              >
                {moodOption && (
                  <Text style={styles.dayEmoji}>{moodOption.emoji}</Text>
                )}
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {days[index]}
              </Text>
            </View>
          );
        })}
      </View>

      {longestStreak > 0 && (
        <View style={styles.bestStreak}>
          <Text style={styles.bestStreakText}>
            Best streak:{' '}
            <Text style={styles.bestStreakValue}>{longestStreak} days</Text>
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

function QuickActions() {
  const router = useRouter();
  const haptics = useHaptics();

  const handleNavigation = useCallback(
    (route: string) => {
      haptics.light();
      router.push(route as any);
    },
    [router, haptics]
  );

  const actions = [
    {
      id: 'breathe',
      title: 'Breathe',
      subtitle: 'Calm your mind',
      route: '/breathing',
      bgColor: '#5a9470',
      textColor: '#fff',
      isPrimary: true,
    },
    {
      id: 'voice',
      title: 'Voice Chat',
      subtitle: 'Talk with Matcha',
      route: '/voice-session',
      bgColor: '#dcedde',
      textColor: '#3d654c',
      isPrimary: true,
    },
    {
      id: 'focus',
      title: 'Focus',
      subtitle: 'Guided exercise',
      route: '/flash-session',
      bgColor: '#fff',
      textColor: '#4a7c5d',
      borderColor: '#dcedde',
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Get help',
      route: '/crisis',
      bgColor: '#fff',
      textColor: '#c97d52',
      borderColor: '#f5ebe0',
    },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      layout={Layout.springify()}
      style={styles.actionsContainer}
    >
      <Text style={styles.sectionTitle}>Quick Start</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <AnimatedPressable
            key={action.id}
            style={[
              styles.actionCard,
              {
                backgroundColor: action.bgColor,
                borderWidth: action.borderColor ? 1 : 0,
                borderColor: action.borderColor,
              },
              action.isPrimary && styles.actionCardPrimary,
            ]}
            onPress={() => handleNavigation(action.route)}
            hapticFeedback="medium"
          >
            <Text style={[styles.actionTitle, { color: action.textColor }]}>
              {action.title}
            </Text>
            <Text
              style={[
                styles.actionSubtitle,
                { color: action.textColor, opacity: 0.7 },
              ]}
            >
              {action.subtitle}
            </Text>
          </AnimatedPressable>
        ))}
      </View>
    </Animated.View>
  );
}

function JourneyStats() {
  const { totalSessions, totalMessages, breathingSessionsCompleted } =
    useUserStore();

  const stats = [
    { value: totalSessions, label: 'sessions' },
    { value: totalMessages, label: 'messages' },
    { value: breathingSessionsCompleted, label: 'breaths' },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(400).springify()}
      layout={Layout.springify()}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>Your Journey</Text>
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={styles.statNumber}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {index < stats.length - 1 && <View style={styles.statDivider} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { updateStreak } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    updateStreak();
    setTimeout(() => setRefreshing(false), 500);
  }, [updateStreak]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#5a9470"
            colors={['#5a9470']}
          />
        }
      >
        <MoodCheckIn />
        <WeekMoodStreak />
        <QuickActions />
        <JourneyStats />

        {/* Disclaimer */}
        <Animated.Text
          entering={FadeInDown.delay(500).springify()}
          style={styles.disclaimer}
        >
          Matcha is for self-reflection and entertainment only. Not a
          substitute for professional care.
        </Animated.Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefdfb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2d3a2e',
  },

  // Mood Check-in (compact)
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: '#2d3a2e',
  },
  savedBadge: {
    backgroundColor: '#dcedde',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savedLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: '#5a9470',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
  },
  moodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },

  // Week Streak
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5a9470',
    marginRight: 6,
  },
  streakLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#a69889',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5ebe0',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: '#5a9470',
  },
  dayEmoji: {
    fontSize: 16,
  },
  dayLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#c4b8ab',
  },
  dayLabelToday: {
    color: '#5a9470',
  },
  bestStreak: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0ebe4',
  },
  bestStreakText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#a69889',
  },
  bestStreakValue: {
    fontFamily: 'DMSans_600SemiBold',
    color: '#c97d52',
  },

  // Quick Actions
  actionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#2d3a2e',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#2d3a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardPrimary: {
    shadowOpacity: 0.08,
  },
  actionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: '#5a9470',
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#a69889',
    marginTop: 4,
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: '#f0ebe4',
  },

  // Disclaimer
  disclaimer: {
    fontFamily: 'DMSans_400Regular',
    color: '#c4b8ab',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
});
