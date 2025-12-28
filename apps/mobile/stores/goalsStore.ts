import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoalCategory = 'health' | 'mindfulness' | 'growth' | 'habits' | 'custom';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  createdAt: string;
  color: string;
}

export interface FinishedGoal extends Goal {
  completedAt: string;
  daysToComplete: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DailyProgress {
  date: string;
  completedTodos: number;
  totalTodos: number;
  goalsWorkedOn: string[];
}

// Motivational messages for goal completion
export const CELEBRATION_MESSAGES = [
  { title: "You did it!", subtitle: "Every goal achieved is a step toward your best self." },
  { title: "Goal crushed!", subtitle: "Your dedication is truly inspiring." },
  { title: "Amazing work!", subtitle: "Consistency beats perfection every time." },
  { title: "Victory!", subtitle: "You proved that you can do hard things." },
  { title: "Incredible!", subtitle: "This is what growth looks like." },
  { title: "Well done!", subtitle: "Celebrate this moment — you earned it." },
  { title: "Success!", subtitle: "Your future self is thanking you right now." },
  { title: "Nailed it!", subtitle: "Small wins lead to big transformations." },
];

export const getRandomCelebrationMessage = () => {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
};

interface GoalsState {
  goals: Goal[];
  finishedGoals: FinishedGoal[];
  todos: Todo[];
  dailyProgress: DailyProgress[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalGoalsCompleted: number;

  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => void;
  updateGoalProgress: (id: string, value: number) => boolean; // Returns true if goal completed
  deleteGoal: (id: string) => void;
  resetGoal: (id: string) => void;
  completeGoal: (id: string) => FinishedGoal | null;
  deleteFinishedGoal: (id: string) => void;
  clearFinishedGoals: () => void;

  // Todo actions
  addTodo: (text: string, priority?: Todo['priority']) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompletedTodos: () => void;
  getTodayTodos: () => Todo[];
  getCompletedTodayCount: () => number;

  // Streak actions
  updateStreak: () => void;
  getWeeklyProgress: () => DailyProgress[];

  // Stats
  getCompletionRate: () => number;
  getTotalCompleted: () => number;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const GOAL_COLORS = ['#5a9470', '#c97d52', '#7d8fa9', '#9a7d8f', '#8fa97d'];

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      finishedGoals: [],
      todos: [],
      dailyProgress: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalGoalsCompleted: 0,

      // Goal actions
      addGoal: (goalData) => {
        const newGoal: Goal = {
          id: generateId(),
          ...goalData,
          currentValue: 0,
          createdAt: new Date().toISOString(),
          color: goalData.color || GOAL_COLORS[get().goals.length % GOAL_COLORS.length],
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoalProgress: (id, value) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return false;

        const newValue = Math.min(value, goal.targetValue);
        const isCompleted = newValue >= goal.targetValue;

        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, currentValue: newValue } : g
          ),
        }));

        get().updateStreak();
        return isCompleted;
      },

      completeGoal: (id) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return null;

        const now = new Date();
        const createdDate = new Date(goal.createdAt);
        const daysToComplete = Math.max(1, Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

        const finishedGoal: FinishedGoal = {
          ...goal,
          currentValue: goal.targetValue,
          completedAt: now.toISOString(),
          daysToComplete,
        };

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          finishedGoals: [finishedGoal, ...state.finishedGoals],
          totalGoalsCompleted: state.totalGoalsCompleted + 1,
        }));

        return finishedGoal;
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      resetGoal: (id) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, currentValue: 0 } : goal
          ),
        }));
      },

      deleteFinishedGoal: (id) => {
        set((state) => ({
          finishedGoals: state.finishedGoals.filter((g) => g.id !== id),
        }));
      },

      clearFinishedGoals: () => {
        set({ finishedGoals: [] });
      },

      // Todo actions
      addTodo: (text, priority = 'medium') => {
        const newTodo: Todo = {
          id: generateId(),
          text,
          completed: false,
          createdAt: new Date().toISOString(),
          priority,
        };
        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));
      },

      toggleTodo: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed ? now : undefined,
                }
              : todo
          ),
        }));
        get().updateStreak();
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      clearCompletedTodos: () => {
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        }));
      },

      getTodayTodos: () => {
        const today = getDateString();
        return get().todos.filter(
          (todo) => todo.createdAt.startsWith(today) || !todo.completed
        );
      },

      getCompletedTodayCount: () => {
        const today = getDateString();
        return get().todos.filter(
          (todo) => todo.completed && todo.completedAt?.startsWith(today)
        ).length;
      },

      // Streak actions
      updateStreak: () => {
        const today = getDateString();
        const { lastActiveDate, currentStreak, longestStreak, dailyProgress, todos } = get();

        // Record daily progress
        const todayProgress = dailyProgress.find((p) => p.date === today);
        const completedToday = todos.filter(
          (t) => t.completed && t.completedAt?.startsWith(today)
        ).length;
        const totalToday = todos.filter(
          (t) => t.createdAt.startsWith(today) || !t.completed
        ).length;

        const updatedProgress = todayProgress
          ? dailyProgress.map((p) =>
              p.date === today
                ? { ...p, completedTodos: completedToday, totalTodos: totalToday }
                : p
            )
          : [
              ...dailyProgress,
              {
                date: today,
                completedTodos: completedToday,
                totalTodos: totalToday,
                goalsWorkedOn: [],
              },
            ].slice(-30); // Keep last 30 days

        if (lastActiveDate === today) {
          set({ dailyProgress: updatedProgress });
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = getDateString(yesterday);

        let newStreak = currentStreak;

        if (lastActiveDate === yesterdayString) {
          newStreak = currentStreak + 1;
        } else if (lastActiveDate !== today) {
          newStreak = 1;
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
          dailyProgress: updatedProgress,
        });
      },

      getWeeklyProgress: () => {
        const progress = get().dailyProgress;
        const today = new Date();
        const weekDates: string[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          weekDates.push(getDateString(date));
        }

        return weekDates.map((date) => {
          const existing = progress.find((p) => p.date === date);
          return (
            existing || {
              date,
              completedTodos: 0,
              totalTodos: 0,
              goalsWorkedOn: [],
            }
          );
        });
      },

      // Stats
      getCompletionRate: () => {
        const todos = get().todos;
        if (todos.length === 0) return 0;
        const completed = todos.filter((t) => t.completed).length;
        return Math.round((completed / todos.length) * 100);
      },

      getTotalCompleted: () => {
        return get().todos.filter((t) => t.completed).length;
      },
    }),
    {
      name: 'matcha-goals-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
