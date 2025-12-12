import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  mood: MoodLevel;
  timestamp: string; // Full ISO timestamp
}

export interface UserPreferences {
  // Onboarding
  hasCompletedOnboarding: boolean;
  goals: string[]; // e.g., ['anxiety', 'stress', 'self-discovery']

  // Mood tracking
  moodHistory: MoodEntry[];
  todayMood: MoodLevel | null;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;

  // Stats
  totalSessions: number;
  totalMessages: number;
  breathingSessionsCompleted: number;
}

interface UserState extends UserPreferences {
  // Onboarding actions
  setOnboardingComplete: (complete: boolean) => void;
  setGoals: (goals: string[]) => void;

  // Mood actions
  setTodayMood: (mood: MoodLevel) => void;
  getMoodForDate: (date: string) => MoodEntry | undefined;
  getWeekMoods: () => MoodEntry[];

  // Streak actions
  updateStreak: () => void;

  // Stats actions
  incrementSessions: () => void;
  incrementMessages: () => void;
  incrementBreathingSessions: () => void;

  // Reset
  resetUserData: () => void;
}

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const initialState: UserPreferences = {
  hasCompletedOnboarding: false,
  goals: [],
  moodHistory: [],
  todayMood: null,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalSessions: 0,
  totalMessages: 0,
  breathingSessionsCompleted: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Onboarding
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      setGoals: (goals) => set({ goals }),

      // Mood
      setTodayMood: (mood) => {
        const today = getDateString();
        const timestamp = new Date().toISOString();

        set((state) => {
          // Remove any existing entry for today
          const filteredHistory = state.moodHistory.filter(
            (entry) => entry.date !== today
          );

          // Add new entry
          const newEntry: MoodEntry = { date: today, mood, timestamp };

          return {
            todayMood: mood,
            moodHistory: [...filteredHistory, newEntry].slice(-90), // Keep last 90 days
          };
        });

        // Update streak when mood is logged
        get().updateStreak();
      },

      getMoodForDate: (date) => {
        return get().moodHistory.find((entry) => entry.date === date);
      },

      getWeekMoods: () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        return get().moodHistory.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekAgo && entryDate <= today;
        });
      },

      // Streaks
      updateStreak: () => {
        const today = getDateString();
        const { lastActiveDate, currentStreak, longestStreak } = get();

        if (lastActiveDate === today) {
          // Already updated today
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = getDateString(yesterday);

        let newStreak = currentStreak;

        if (lastActiveDate === yesterdayString) {
          // Consecutive day
          newStreak = currentStreak + 1;
        } else if (lastActiveDate !== today) {
          // Streak broken
          newStreak = 1;
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
        });
      },

      // Stats
      incrementSessions: () => set((state) => ({ totalSessions: state.totalSessions + 1 })),
      incrementMessages: () => set((state) => ({ totalMessages: state.totalMessages + 1 })),
      incrementBreathingSessions: () => set((state) => ({
        breathingSessionsCompleted: state.breathingSessionsCompleted + 1
      })),

      // Reset
      resetUserData: () => set(initialState),
    }),
    {
      name: 'matcha-user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
