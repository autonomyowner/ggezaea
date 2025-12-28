import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type JournalEntryType = 'reflection' | 'gratitude' | 'freeform';

export interface JournalEntry {
  id: string;
  type: JournalEntryType;
  content: string;
  prompt?: string;
  mood?: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

interface JournalState {
  entries: JournalEntry[];

  // Actions
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => JournalEntry;
  updateEntry: (id: string, content: string) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => JournalEntry | undefined;
  getEntriesByDate: (date: string) => JournalEntry[];
  getEntriesByType: (type: JournalEntryType) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
  getTodayEntries: () => JournalEntry[];
  getStreak: () => number;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entryData) => {
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          id: generateId(),
          ...entryData,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        return newEntry;
      },

      updateEntry: (id, content) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, content, updatedAt: new Date().toISOString() }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      getEntry: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },

      getEntriesByDate: (date) => {
        return get().entries.filter(
          (entry) => entry.createdAt.startsWith(date)
        );
      },

      getEntriesByType: (type) => {
        return get().entries.filter((entry) => entry.type === type);
      },

      getRecentEntries: (limit = 10) => {
        return get().entries.slice(0, limit);
      },

      getTodayEntries: () => {
        const today = getDateString();
        return get().getEntriesByDate(today);
      },

      getStreak: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;

        const uniqueDates = [...new Set(
          entries.map((e) => e.createdAt.split('T')[0])
        )].sort().reverse();

        if (uniqueDates.length === 0) return 0;

        const today = getDateString();
        const yesterday = getDateString(new Date(Date.now() - 86400000));

        // Check if we have an entry today or yesterday
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
          return 0;
        }

        let streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.floor(
            (currentDate.getTime() - prevDate.getTime()) / 86400000
          );

          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'matcha-journal-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Daily reflection prompts
export const REFLECTION_PROMPTS = [
  "What's one thing you're grateful for today?",
  "How are you feeling right now? Take a moment to describe it.",
  "What's something small that brought you joy recently?",
  "What would make today a good day?",
  "What's one thing you'd like to let go of today?",
  "Describe a moment when you felt at peace.",
  "What's something kind you did for yourself or others?",
  "What are you looking forward to?",
  "What's a challenge you're facing? How might you approach it?",
  "What's one thing you learned about yourself recently?",
  "If you could give your past self advice, what would it be?",
  "What does self-care look like for you today?",
  "Describe your ideal peaceful moment.",
  "What's a boundary you'd like to set or maintain?",
  "What accomplishment, big or small, are you proud of?",
  "How can you show yourself compassion today?",
  "What's weighing on your mind? Write it out.",
  "What brings you comfort when you're stressed?",
  "Describe a relationship that matters to you.",
  "What would you tell a friend going through what you're experiencing?",
];

// Gratitude prompts
export const GRATITUDE_PROMPTS = [
  "Three things I'm grateful for today...",
  "A person who made a difference in my life...",
  "Something simple that I often take for granted...",
  "A recent experience that made me smile...",
  "Something about myself I appreciate...",
  "A comfort or convenience I'm thankful for...",
  "Someone who believed in me...",
  "A lesson I'm grateful to have learned...",
  "A place that brings me peace...",
  "An opportunity I'm thankful for...",
];

// Get today's prompt based on the date
export const getTodayPrompt = (): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
};

export const getRandomGratitudePrompt = (): string => {
  return GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)];
};
