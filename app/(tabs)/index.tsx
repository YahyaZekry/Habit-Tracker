import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/colors';
import { useAppTheme } from '../../context/ThemeContext';
import { useHabits } from '../../context/HabitContext';
import { HabitItem } from '../../components/HabitItem';
import { EmptyState } from '../../components/EmptyState';
import { HabitForm } from '../../components/HabitForm';
import { formatDate, getDayName } from '../../utils/dateUtils';

export default function TodayScreen() {
  const { habits } = useHabits();
  const { currentTheme: theme, effectiveTheme } = useAppTheme();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const scrollViewRef = useRef<ScrollView>(null);
  // Removed scrollViewWidth state

  // Get dates for the month view
  const getMonthDates = useCallback(() => {
    const dates = [];
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    for (
      let d = firstDayOfMonth;
      d <= lastDayOfMonth;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d));
    }

    return dates;
  }, [today]);

  const weekDates = getMonthDates();

  const scrollToDate = useCallback(
    (targetDate: Date, animated = true) => {
      if (scrollViewRef.current) {
        const targetIndex = weekDates.findIndex(
          (date) => formatDate(date) === formatDate(targetDate)
        );

        if (targetIndex === -1) return; // Date not found

        // The contentContainer has paddingLeft: SCREEN_WIDTH / 2.
        // This means the point 0 of the scrollable content is visually at the screen center.
        // We want to bring the center of the targetItem to this point (coordinate 0 of scrollable content).
        // The center of the targetItem is at (targetIndex * TOTAL_ITEM_WIDTH + TOTAL_ITEM_WIDTH / 2)
        // from the start of the scrollable content.
        // So, we need to scroll by this amount.
        const scrollX = targetIndex * TOTAL_ITEM_WIDTH + TOTAL_ITEM_WIDTH / 2;

        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollTo({
            x: Math.max(0, scrollX),
            animated: animated,
          });
        });
      }
    },
    [weekDates] // TOTAL_ITEM_WIDTH is a module constant
  );

  const scrollToToday = useCallback(() => {
    scrollToDate(today, true); // Scroll with animation for explicit "go to today"
  }, [scrollToDate, today]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (date <= today) {
        // Ensure we don't select future dates
        setSelectedDate(date);
        scrollToDate(date, true); // Scroll to the selected date with animation
      }
    },
    [today, scrollToDate]
  );

  // Only scroll on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Scroll to initially selected date (today) without animation for a smoother start
      // This ensures the view starts centered on the correct date.
      scrollToDate(selectedDate, false);
    }, 150); // A small delay for layout to settle, can be adjusted
    return () => clearTimeout(timer);
  }, [selectedDate, scrollToDate]); // Rerun if selectedDate or scrollToDate changes (e.g. on hot reload)

  // Sort habits based on their position
  const sortedHabits = [...habits].sort((a, b) => a.position - b.position);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.default }]}
      edges={['right', 'left']}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: theme.text.secondary }]}>
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Your Habits
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: COLORS.primary.main }]}
          onPress={() => setShowAddHabit(true)}
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        <LinearGradient
          colors={[theme.background.default, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.leftGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', theme.background.default]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.rightGradient}
          pointerEvents="none"
        />
        <ScrollView
          // Removed onLayout prop
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScroll}
          decelerationRate="fast"
          // Removed snapToInterval and snapToAlignment to rely on programmatic centering
        >
          {weekDates.map((date, index) => {
            const isSelected = formatDate(date) === formatDate(selectedDate);
            const isToday = date.getTime() === today.getTime();
            // Show month if it's the first date or first of the month
            // Also show if previous date was in a different month
            const showMonth =
              index === 0 ||
              date.getMonth() !== weekDates[Math.max(0, index - 1)].getMonth();

            return (
              <TouchableOpacity
                key={formatDate(date)}
                style={[
                  styles.dayButton,
                  isSelected &&
                    date <= today && {
                      backgroundColor: COLORS.primary.main,
                    },
                  date > today && {
                    opacity: 0.5,
                  },
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <View style={styles.dayContent}>
                  {showMonth && (
                    <Text
                      style={[
                        styles.monthText,
                        {
                          color:
                            date <= today
                              ? theme.text.secondary
                              : theme.text.disabled,
                        },
                      ]}
                    >
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: undefined,
                        year:
                          date.getFullYear() !== new Date().getFullYear()
                            ? 'numeric'
                            : undefined,
                      })}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.dayOfWeek,
                      {
                        color:
                          date <= today
                            ? isSelected
                              ? COLORS.primary.contrastText
                              : theme.text.secondary
                            : theme.text.disabled,
                      },
                    ]}
                  >
                    {getDayName(date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dayNumber,
                    // Highlight today's number if it's today AND not selected
                    isToday && !isSelected && { color: COLORS.primary.main },
                    // General color rules
                    {
                      color:
                        date <= today
                          ? isSelected
                            ? COLORS.primary.contrastText
                            : theme.text.primary
                          : theme.text.disabled,
                    },
                  ]}
                >
                  {date.getDate()}
                </Text>
                {/* Show dot if it's today, regardless of selection. Selection is shown by background. */}
                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      {
                        backgroundColor: isSelected
                          ? COLORS.primary.contrastText
                          : COLORS.primary.main,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {showAddHabit ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: theme.text.primary }}>Loading form...</Text>
        </View>
      ) : sortedHabits.length > 0 ? (
        <ScrollView style={styles.habitList}>
          {sortedHabits.map((habit) => (
            <HabitItem
              key={habit.id}
              habitId={habit.id}
              date={formatDate(selectedDate)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          title="No habits yet"
          message="Start tracking your daily habits to build consistency and achieve your goals."
          buttonText="Add Your First Habit"
          onButtonPress={() => setShowAddHabit(true)}
          icon={<CalendarDays size={48} color={COLORS.primary.main} />}
        />
      )}

      <Modal
        visible={showAddHabit}
        animationType="fade"
        transparent={true} // Changed back to true
        onRequestClose={() => setShowAddHabit(false)}
      >
        <View
          style={[
            styles.modalBackdrop,
            {
              backgroundColor:
                effectiveTheme === 'dark'
                  ? 'rgba(0,0,0,0.6)'
                  : 'rgba(0,0,0,0.4)',
            },
          ]}
        >
          <HabitForm onClose={() => setShowAddHabit(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SPACING = 12;
const ITEM_WIDTH = 52;
const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_SPACING * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  weekContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
    height: 100,
    position: 'relative',
  },
  leftGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: TOTAL_ITEM_WIDTH,
    zIndex: 1,
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: TOTAL_ITEM_WIDTH,
    zIndex: 1,
  },
  weekScroll: {
    paddingLeft: SCREEN_WIDTH / 2, // Full screen width padding for better centering
    paddingRight: SCREEN_WIDTH / 2, // Full screen width padding for better centering
  },
  dayButton: {
    width: ITEM_WIDTH,
    height: 88,
    borderRadius: ITEM_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: ITEM_SPACING,
  },
  dayContent: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  habitList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor will be set dynamically in the component
  },
});
