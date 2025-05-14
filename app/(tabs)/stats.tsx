import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, BarChart } from 'lucide-react-native';
import { COLORS } from '../../utils/colors';
import { useAppTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { CalendarView } from '../../components/CalendarView';
import { ProgressBar } from '../../components/ProgressBar';
import { EmptyState } from '../../components/EmptyState';

type StatsTab = 'calendar' | 'progress';

export default function StatsScreen() {
  const { habits, getCompletionRate, getCurrentStreak } = useHabits();
  const { currentTheme: theme, effectiveTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<StatsTab>('calendar');
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>(
    habits.length > 0 ? habits[0].id : undefined
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectDate = useCallback((dateStr: string) => {
    setSelectedDate(new Date(dateStr));
  }, []);

  // Sort habits based on position
  const sortedHabits = [...habits].sort((a, b) => a.position - b.position);

  // Get stats for selected habit
  const selectedHabit = selectedHabitId
    ? habits.find((h) => h.id === selectedHabitId)
    : undefined;

  const lastWeekCompletionRate = selectedHabitId
    ? getCompletionRate(selectedHabitId, 7)
    : 0;

  const lastMonthCompletionRate = selectedHabitId
    ? getCompletionRate(selectedHabitId, 30)
    : 0;

  const currentStreak = selectedHabitId ? getCurrentStreak(selectedHabitId) : 0;

  const renderTabButton = (
    tab: StatsTab,
    label: string,
    icon: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && {
          backgroundColor:
            effectiveTheme === 'dark' ? COLORS.grey[800] : COLORS.grey[100],
          borderColor: COLORS.primary.main,
        },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text
        style={[
          styles.tabButtonText,
          {
            color:
              activeTab === tab ? COLORS.primary.main : theme.text.secondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (habits.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.default },
        ]}
        edges={['right', 'left']}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Statistics
          </Text>
        </View>

        <EmptyState
          title="No stats yet"
          message="Add habits to track your progress and view your statistics."
          icon={<BarChart size={48} color={COLORS.primary.main} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.default }]}
      edges={['right', 'left']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Statistics
        </Text>
      </View>

      <View style={styles.tabs}>
        {renderTabButton(
          'calendar',
          'Calendar',
          <Calendar
            size={16}
            color={
              activeTab === 'calendar'
                ? COLORS.primary.main
                : theme.text.secondary
            }
          />
        )}
        {renderTabButton(
          'progress',
          'Progress',
          <BarChart
            size={16}
            color={
              activeTab === 'progress'
                ? COLORS.primary.main
                : theme.text.secondary
            }
          />
        )}
      </View>

      {sortedHabits.length > 0 && (
        <View style={styles.habitSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitButtons}
          >
            {sortedHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitButton,
                  {
                    backgroundColor:
                      selectedHabitId === habit.id
                        ? habit.color
                        : effectiveTheme === 'dark'
                        ? COLORS.grey[800]
                        : COLORS.grey[200],
                  },
                ]}
                onPress={() => setSelectedHabitId(habit.id)}
              >
                <Text
                  style={[
                    styles.habitButtonText,
                    {
                      color:
                        selectedHabitId === habit.id
                          ? '#FFFFFF'
                          : theme.text.primary,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {habit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content}>
        {activeTab === 'calendar' && selectedHabitId && (
          <View style={styles.calendarContainer}>
            <CalendarView
              habitId={selectedHabitId}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          </View>
        )}

        {activeTab === 'progress' && selectedHabitId && selectedHabit && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.streakCard,
                { backgroundColor: theme.background.paper },
              ]}
            >
              <Text
                style={[styles.streakCardTitle, { color: theme.text.primary }]}
              >
                Current Streak
              </Text>
              <View style={styles.streakValue}>
                <Text
                  style={[
                    styles.streakNumber,
                    {
                      color:
                        currentStreak > 0
                          ? COLORS.primary.main
                          : theme.text.secondary,
                    },
                  ]}
                >
                  {currentStreak}
                </Text>
                <Text
                  style={[styles.streakUnit, { color: theme.text.secondary }]}
                >
                  {currentStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
              {currentStreak > 0 && (
                <Text style={[styles.streakEmoji]}>🔥</Text>
              )}
            </View>

            <View
              style={[
                styles.statsCard,
                { backgroundColor: theme.background.paper },
              ]}
            >
              <Text
                style={[styles.statsCardTitle, { color: theme.text.primary }]}
              >
                Last 7 Days
              </Text>
              <ProgressBar
                progress={lastWeekCompletionRate}
                height={10}
                color={COLORS.primary.main}
                showPercentage
              />

              <Text
                style={[
                  styles.statsCardTitle,
                  { color: theme.text.primary, marginTop: 24 },
                ]}
              >
                Last 30 Days
              </Text>
              <ProgressBar
                progress={lastMonthCompletionRate}
                height={10}
                color={selectedHabit.color}
                showPercentage
              />

              <Text
                style={[
                  styles.statsCardTitle,
                  { color: theme.text.primary, marginTop: 24 },
                ]}
              >
                Goal Progress
              </Text>
              <View style={styles.goalInfo}>
                <Text
                  style={[styles.goalText, { color: theme.text.secondary }]}
                >
                  {selectedHabit.goalCount} times per {selectedHabit.goalPeriod}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  habitSelector: {
    marginBottom: 16,
  },
  habitButtons: {
    paddingHorizontal: 12,
  },
  habitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 100,
  },
  habitButtonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  streakCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  streakUnit: {
    fontSize: 16,
    marginLeft: 4,
  },
  streakEmoji: {
    fontSize: 32,
    marginTop: 8,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalInfo: {
    marginTop: 4,
  },
  goalText: {
    fontSize: 14,
  },
});
