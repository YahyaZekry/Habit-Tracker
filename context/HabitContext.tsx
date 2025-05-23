import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { formatDate } from '../utils/dateUtils';

// Types
export interface Habit {
  id: string;
  name: string;
  description: string;
  goalCount: number;
  goalPeriod: 'day'; // Changed to only 'day'
  color: string;
  createdAt: string;
  position: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'position'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  getCompletionsForHabit: (
    habitId: string,
    startDate: Date,
    endDate: Date
  ) => HabitCompletion[];
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getCurrentStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getGoalProgress: (habitId: string) => { completed: number; goal: number };
  isHabitCompletedForDate: (habitId: string, date: string) => boolean;
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

// Create context
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Provider component
export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const habitsData = await AsyncStorage.getItem('habits');
        const completionsData = await AsyncStorage.getItem('completions');

        if (habitsData) {
          setHabits(JSON.parse(habitsData));
        }

        if (completionsData) {
          setCompletions(JSON.parse(completionsData));
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load habits data');
        console.error('Failed to load habits data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Debounced save function
  const debouncedSaveData = useCallback(async () => {
    if (!isLoaded) return;

    console.log('Attempting to save data...'); // Add log for debugging
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(habits));
      await AsyncStorage.setItem('completions', JSON.stringify(completions));
      console.log('Data saved successfully.'); // Add success log
    } catch (error) {
      Alert.alert('Error', 'Failed to save habits data');
      console.error('Failed to save habits data:', error);
    }
  }, [habits, completions, isLoaded]);

  // Effect to trigger debounced save
  useEffect(() => {
    if (!isLoaded) return;

    // Clear existing timeout if there is one
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSaveData();
    }, 1000); // Debounce time: 1000ms (1 second)

    // Cleanup function to clear timeout if component unmounts or dependencies change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [habits, completions, isLoaded, debouncedSaveData]);

  // Add a new habit
  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'position'>) => {
    const newHabit: Habit = {
      ...habit,
      id: uuid.v4() as string,
      createdAt: new Date().toISOString(),
      position: habits.length,
    };

    setHabits((prev) => [...prev, newHabit]);
  };

  // Update an existing habit
  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit))
    );
  };

  // Delete a habit
  const deleteHabit = (id: string) => {
    setHabits((prev) => {
      const filtered = prev.filter((habit) => habit.id !== id);
      // Update positions after deletion
      return filtered.map((habit, index) => ({ ...habit, position: index }));
    });

    // Also remove all completions for this habit
    setCompletions((prev) =>
      prev.filter((completion) => completion.habitId !== id)
    );
  };

  // Reorder habits
  const reorderHabits = (orderedIds: string[]) => {
    setHabits((prev) => {
      const habitMap = new Map(prev.map((habit) => [habit.id, habit]));
      return orderedIds.map((id, index) => {
        const habit = habitMap.get(id);
        if (!habit) throw new Error(`Habit with id ${id} not found`);
        return { ...habit, position: index };
      });
    });
  };

  // Toggle completion status for a habit on a specific date
  const toggleCompletion = useCallback(
    (habitId: string, date: string) => {
      // Normalize the date string to ensure consistent format with local time
      const normalizedDate = formatDate(new Date(date));

      // For debugging
      console.log(
        `toggleCompletion - date: ${date}, normalizedDate: ${normalizedDate}`
      );

      // Find existing completion in O(1) time with a direct lookup
      const existingCompletion = completions.find(
        (c) => c.habitId === habitId && c.date === normalizedDate
      );

      if (existingCompletion) {
        // Toggle existing completion - use a faster implementation
        const updatedCompletions = [...completions]; // Create a new array
        const idx = updatedCompletions.findIndex(
          (c) => c.id === existingCompletion.id
        );
        // Update directly for better performance
        if (idx !== -1) {
          updatedCompletions[idx] = {
            ...existingCompletion,
            completed: !existingCompletion.completed,
          };
          // Update state immediately for UI responsiveness
          setCompletions(updatedCompletions);
          // Save asynchronously to avoid UI blocking
          setTimeout(() => {
            AsyncStorage.setItem(
              'completions',
              JSON.stringify(updatedCompletions)
            ).catch((err) => console.error('Failed to save completions', err));
          }, 0);
        }
      } else {
        // Create new completion
        const newCompletion = {
          id: uuid.v4() as string,
          habitId,
          date: normalizedDate,
          completed: true,
        };

        // Update state immediately for UI responsiveness
        const updatedCompletions = [...completions, newCompletion];
        setCompletions(updatedCompletions);

        // Save asynchronously to avoid UI blocking
        setTimeout(() => {
          AsyncStorage.setItem(
            'completions',
            JSON.stringify(updatedCompletions)
          ).catch((err) => console.error('Failed to save completions', err));
        }, 0);
      }
    },
    [completions]
  );

  // Get completions for a habit within a date range
  const getCompletionsForHabit = (
    habitId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const start = startDate.getTime();
    const end = endDate.getTime();

    return completions.filter((completion) => {
      if (completion.habitId !== habitId) return false;

      const completionDate = new Date(completion.date).getTime();
      return completionDate >= start && completionDate <= end;
    });
  };

  // Get completions for a specific date
  const getCompletionsForDate = (date: string) => {
    return completions.filter((completion) => completion.date === date);
  };

  // Check if a habit is completed for a specific date
  const isHabitCompletedForDate = useCallback(
    (habitId: string, date: string) => {
      // Normalize the date string to ensure consistent format
      const normalizedDate = formatDate(new Date(date));

      // Debug log
      //console.log(`isHabitCompletedForDate - date: ${date}, normalizedDate: ${normalizedDate}`);

      // Use direct array lookups for better performance
      const result = !!completions.find(
        (c) => c.habitId === habitId && c.date === normalizedDate && c.completed
      );

      // Debug log
      //console.log(`isHabitCompletedForDate - habitId: ${habitId}, match: ${result}`);

      return result;
    },
    [completions]
  );

  // Get current streak for a habit
  const getCurrentStreak = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Check today first
    const todayStr = formatDate(currentDate);
    const isTodayCompleted = isHabitCompletedForDate(habitId, todayStr);

    // If today is not completed, check if yesterday was completed to start the streak
    if (!isTodayCompleted) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Now count consecutive days
    while (true) {
      const dateStr = formatDate(currentDate);
      const isCompleted = isHabitCompletedForDate(habitId, dateStr);

      if (!isCompleted) {
        break;
      }

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Get completion rate for a habit
  const getCompletionRate = (habitId: string, days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days + 1);

    let completedDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateString = formatDate(currentDate);
      if (isHabitCompletedForDate(habitId, dateString)) {
        completedDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days > 0 ? completedDays / days : 0;
  };

  // Get goal progress for a habit (completed days out of goal)
  const getGoalProgress = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return { completed: 0, goal: 0 };

    // Count all days where the habit was completed
    const completedDays = completions.filter(
      (c) => c.habitId === habitId && c.completed
    ).length;

    return {
      completed: completedDays,
      goal: habit.goalCount,
    };
  };

  // Export data as JSON
  const exportData = async () => {
    const data = { habits, completions };
    return JSON.stringify(data);
  };

  // Import data from JSON
  const importData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.habits && Array.isArray(data.habits)) {
        setHabits(data.habits);
      }

      if (data.completions && Array.isArray(data.completions)) {
        setCompletions(data.completions);
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject('Invalid data format');
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        completions,
        addHabit,
        updateHabit,
        deleteHabit,
        reorderHabits,
        toggleCompletion,
        getCompletionsForHabit,
        getCompletionsForDate,
        getCurrentStreak,
        getCompletionRate,
        getGoalProgress,
        isHabitCompletedForDate,
        exportData,
        importData,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

// Custom hook for using the habit context
export const useHabits = () => {
  const context = useContext(HabitContext);

  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }

  return context;
};
