import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Lock, Check, X } from 'lucide-react-native';
import { COLORS } from '../utils/colors';
import { useAppTheme } from '../context/ThemeContext';
import {
  getDaysInMonth,
  getMonthName,
  getMonthDates,
  isSameDay,
  isSameMonth,
  formatDate,
} from '../utils/dateUtils';
import { getColorWithOpacity } from '../utils/colors';
import { useHabits } from '../context/HabitContext';

interface CalendarViewProps {
  habitId?: string;
  onSelectDate?: (date: string) => void;
  selectedDate?: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  habitId,
  onSelectDate,
  selectedDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const { currentTheme: theme } = useAppTheme();
  const {
    isHabitCompletedForDate,
    habits,
    getCompletionRate,
    getCurrentStreak,
  } = useHabits();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get calendar dates for the month
  const calendarDates = getMonthDates(
    currentMonth.getMonth(),
    currentMonth.getFullYear()
  );

  // Get data for the specific habit if habitId is provided
  const habit = habitId ? habits.find((h) => h.id === habitId) : undefined;
  const completionRate = habitId ? getCompletionRate(habitId, 30) : 0;
  const streak = habitId ? getCurrentStreak(habitId) : 0;

  const changeMonth = useCallback((increment: number) => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + increment);
      return newMonth;
    });
  }, []);

  const isDateInteractive = useCallback(
    (date: Date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      return (
        isSameDay(normalizedDate, today) || isSameDay(normalizedDate, tomorrow)
      );
    },
    [today, tomorrow]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (!isDateInteractive(date)) return;

      if (onSelectDate) {
        onSelectDate(formatDate(date));
      }
    },
    [onSelectDate, isDateInteractive]
  );

  const renderDay = useCallback(
    (date: Date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      const isSelected = isSameDay(date, selectedDate);
      const isCurrentMonth = isSameMonth(date, currentMonth);
      const isToday = isSameDay(date, today);
      const isTomorrow = isSameDay(date, tomorrow);
      const isPast = normalizedDate < today;
      const isFuture = normalizedDate > tomorrow;

      // Check if the habit is completed on this date
      const dateStr = formatDate(date);
      const isCompleted = habitId
        ? isHabitCompletedForDate(habitId, dateStr)
        : false;

      const interactive = isDateInteractive(date);

      return (
        <TouchableOpacity
          key={dateStr}
          style={[
            styles.day,
            !isCurrentMonth && styles.dayOutsideMonth,
            isToday && [
              styles.today,
              {
                backgroundColor: getColorWithOpacity(COLORS.primary.light, 0.2),
              },
            ],
            isSelected && [
              styles.selectedDay,
              { backgroundColor: COLORS.primary.main },
            ],
            !interactive && styles.disabledDay,
          ]}
          onPress={() => handleDateSelect(date)}
          disabled={!interactive || !isCurrentMonth}
        >
          <Text
            style={[
              styles.dayText,
              { color: theme.text.primary },
              !isCurrentMonth && { color: theme.text.disabled },
              isToday && { fontWeight: '700' },
              isSelected && [
                styles.selectedDayText,
                { color: COLORS.primary.contrastText },
              ],
              !interactive && [
                styles.disabledDayText,
                { color: theme.text.disabled },
              ],
            ]}
          >
            {date.getDate()}
          </Text>

          {isCurrentMonth && (
            <View style={styles.statusContainer}>
              {isFuture ? (
                <Lock size={14} color={theme.text.disabled} />
              ) : isPast ? (
                isCompleted ? (
                  <Check size={14} color={COLORS.success.main} />
                ) : (
                  <X size={14} color={COLORS.error.main} />
                )
              ) : (
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: COLORS.primary.main },
                    isCompleted && styles.checkboxCompleted,
                  ]}
                >
                  {isCompleted && (
                    <Check size={12} color={COLORS.primary.contrastText} />
                  )}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [
      currentMonth,
      selectedDate,
      habitId,
      isHabitCompletedForDate,
      handleDateSelect,
      theme,
      today,
      tomorrow,
    ]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.paper }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeMonth(-1)}
        >
          <ChevronLeft size={20} color={theme.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.monthTitle, { color: theme.text.primary }]}>
          {getMonthName(currentMonth)} {currentMonth.getFullYear()}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeMonth(1)}
        >
          <ChevronRight size={20} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.weekdayHeader, { borderBottomColor: theme.divider }]}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text
            key={day}
            style={[styles.weekdayHeaderText, { color: theme.text.secondary }]}
          >
            {day}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.daysContainer}>
        {calendarDates.map((date, index) => (
          <View key={`${formatDate(date)}-${index}`} style={styles.dayWrapper}>
            {renderDay(date)}
          </View>
        ))}
      </ScrollView>

      {habit && (
        <View
          style={[styles.statsContainer, { borderTopColor: theme.divider }]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Completion Rate
            </Text>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>
              {Math.round(completionRate * 100)}%
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Current Streak
            </Text>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>
              {streak} day{streak !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically
    paddingBottom: 8,
  },
  weekdayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    width: '14.28%',
    alignItems: 'center',
    padding: 2,
  },
  day: {
    width: 36,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayOutsideMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
  },
  today: {
    // backgroundColor will be set dynamically
  },
  selectedDay: {
    // backgroundColor will be set dynamically
  },
  selectedDayText: {
    // color will be set dynamically
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.4,
  },
  disabledDayText: {
    // color will be set dynamically
  },
  statusContainer: {
    marginTop: 4,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    // borderColor will be set dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success.main,
    borderColor: COLORS.success.main,
  },
  statsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    // borderTopColor will be set dynamically
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});
