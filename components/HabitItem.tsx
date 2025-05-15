import React, { useRef, useEffect, memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { Check, Circle, Edit2, Trash2 } from 'lucide-react-native';
import { COLORS } from '../utils/colors';
import { useHabits } from '../context/HabitContext';
import { useAppTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/dateUtils';

interface HabitItemProps {
  habitId: string;
  date?: string;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  showActions?: boolean;
  isDraggable?: boolean; // New prop to control drag functionality
  initialY?: number;
  index?: number;
  draggingIndex?: Animated.SharedValue<number>; // Index of the item being dragged
  draggingCurrentY?: Animated.SharedValue<number>; // Current Y position of dragged item
  onDragEnd?: (habitId: string, newPositionIndex: number) => void;
  itemHeight?: number;
  itemSpacing?: number;
  totalItems?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
};

const HabitItemInner: React.FC<HabitItemProps> = ({
  habitId,
  date = formatDate(new Date()),
  onEdit,
  onDelete,
  showActions = false,
  isDraggable = false,
  initialY = 0,
  index = 0,
  draggingIndex: draggingIndexProp,
  draggingCurrentY: draggingCurrentYProp,
  onDragEnd: onDragEndProp,
  itemHeight = 80,
  itemSpacing = 8,
  totalItems = 1,
}) => {
  // Local shared value if not provided (for non-draggable items)
  const localDraggingIndex = useSharedValue(-1);
  const localDraggingCurrentY = useSharedValue(0);
  const draggingIndex = draggingIndexProp || localDraggingIndex;
  const draggingCurrentY = draggingCurrentYProp || localDraggingCurrentY;

  // No-op function if onDragEnd is not provided
  const onDragEnd = onDragEndProp || (() => {});

  const {
    habits,
    completions,
    isHabitCompletedForDate,
    toggleCompletion,
    getCurrentStreak,
  } = useHabits();
  const habit = habits.find((h) => h.id === habitId);
  const { currentTheme: theme } = useAppTheme();
  const scaleAnim = useSharedValue(1); // Using Reanimated shared value
  // Initialize translateY. If not draggable, it will effectively be 0 or its static position.
  // If draggable, initialY prop is expected.
  const translateY = useSharedValue(isDraggable ? initialY : 0);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Ensure consistent date handling using local time
  const normalizedDate = formatDate(new Date(date));

  // For debugging
  console.log(`HabitItem - date: ${date}, normalizedDate: ${normalizedDate}`);

  // Update translateY if initialY changes (e.g., due to reordering by other items)
  // Only applicable if draggable
  useEffect(() => {
    // --- Temporarily commenting out drag-follow logic for debugging freeze ---
    /*
    if (!isDraggable) return;

    // If this item is being dragged, don't respond to position updates
    if (draggingIndex.value === index) return;

    // If no item is being dragged, reset to initial position
    if (draggingIndex.value === -1) {
      translateY.value = withSpring(initialY, SPRING_CONFIG);
      return;
    }

    // Calculate positions and thresholds
    const draggedItemOriginalPos =
      draggingIndex.value * (itemHeight + itemSpacing);
    const draggedItemCurrentPos = draggingCurrentY.value;
    const currentItemPos = index * (itemHeight + itemSpacing);
    const moveThreshold = (itemHeight + itemSpacing) / 2;

    // Calculate distances and direction
    const distanceFromDraggedOriginal = currentItemPos - draggedItemOriginalPos;
    const distanceFromDraggedCurrent = currentItemPos - draggedItemCurrentPos;
    const isDraggingDown = draggedItemCurrentPos > draggedItemOriginalPos;
    const isDraggingUp = draggedItemCurrentPos < draggedItemOriginalPos;

    // Determine if this item should move
    if (
      isDraggingDown &&
      distanceFromDraggedOriginal > 0 &&
      distanceFromDraggedCurrent < moveThreshold
    ) {
      // Move up when item is being dragged down past us
      translateY.value = withSpring(
        initialY - (itemHeight + itemSpacing),
        SPRING_CONFIG
      );
    } else if (
      isDraggingUp &&
      distanceFromDraggedOriginal < 0 &&
      -distanceFromDraggedCurrent < moveThreshold
    ) {
      // Move down when item is being dragged up past us
      translateY.value = withSpring(
        initialY + (itemHeight + itemSpacing),
        SPRING_CONFIG
      );
    } else {
      // Reset to original position
      translateY.value = withSpring(initialY, SPRING_CONFIG);
    }
    */
    // --- End of temporarily commented out block ---

    // Ensure items at least go to their initial Y position if draggable
    if (isDraggable) {
      translateY.value = withSpring(initialY, SPRING_CONFIG);
    } else {
      translateY.value = 0; // Non-draggable items should be at 0
    }
  }, [
    isDraggable,
    initialY,
    // Removed other dependencies for this temporary debugging step
    // draggingIndex?.value,
    // draggingCurrentY?.value,
    // index,
    itemHeight,
    itemSpacing,
    translateY,
  ]);

  if (!habit) {
    return null;
  }

  // Get completion state directly from context without any transformations
  const isCompleted = isHabitCompletedForDate(habitId, normalizedDate);
  const [showConfetti, setShowConfetti] = useState(false);
  const streak = getCurrentStreak(habitId);

  // Get today's completion count
  const todayCompletions = completions.filter(
    (c) => c.habitId === habitId && c.date === normalizedDate && c.completed
  ).length;
  const goalReached = todayCompletions >= habit.goalCount;
  const goalExceeded = todayCompletions > habit.goalCount;

  const isToday = normalizedDate === formatDate(new Date());
  const showCheckbox = !isDraggable && date;

  const handleToggle = () => {
    // Apply immediate visual feedback
    const newCompletedState = !isCompleted;

    // Fast, responsive animation
    scaleAnim.value = withSpring(
      0.95,
      {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
        overshootClamping: false,
        restSpeedThreshold: 0.1,
      },
      () => {
        scaleAnim.value = withSpring(1, {
          damping: 20,
          stiffness: 300,
          mass: 0.5,
          overshootClamping: false,
          restSpeedThreshold: 0.1,
        });
      }
    );

    // Add haptic feedback for better user experience
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Get completions before toggle
    const completionsBeforeToggle = completions.filter(
      (c) => c.habitId === habitId && c.date === normalizedDate && c.completed
    ).length;

    // Toggle completion with normalized date - do this immediately
    toggleCompletion(habitId, normalizedDate);

    // Check if this completion would reach or exceed the goal
    const newCompletions = completionsBeforeToggle + (isCompleted ? -1 : 1);
    if (newCompletedState && newCompletions >= habit.goalCount) {
      // Only trigger animation when checking (not unchecking) and goal is reached
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000); // Reduced from 5000ms to 2000ms
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (isDraggable) {
      return {
        transform: [
          { translateY: translateY.value },
          { scale: scaleAnim.value },
        ],
        zIndex: draggingIndex?.value === index ? 1 : 0,
        position: 'absolute',
        left: 0,
        right: 0,
        height: itemHeight,
        top: 0, // translateY will handle the actual vertical position
      };
    }
    // Styles for non-draggable item
    return {
      transform: [{ scale: scaleAnim.value }], // Only scale animation
      height: itemHeight,
      // Default position, no absolute, no zIndex from dragging
    };
  });

  // Gesture handler is only relevant if draggable
  const gestureHandler = isDraggable
    ? useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startY: number }
      >({
        onStart: (_, ctx) => {
          ctx.startY = translateY.value;
          draggingIndex.value = index;
          draggingCurrentY.value = translateY.value;
          scaleAnim.value = withSpring(1.05, SPRING_CONFIG);
        },
        onActive: (event, ctx) => {
          const newY = ctx.startY + event.translationY;
          translateY.value = Math.max(
            0,
            Math.min((totalItems - 1) * (itemHeight + itemSpacing), newY)
          );
          // Update current Y position for other items to react
          draggingCurrentY.value = translateY.value;
        },
        onEnd: (event, ctx) => {
          draggingIndex.value = -1;
          scaleAnim.value = withSpring(1, SPRING_CONFIG);

          const finalY = translateY.value;
          // Ensure itemHeight is a number for calculation
          const currentItemHeight =
            typeof itemHeight === 'number' ? itemHeight : 80;
          // Calculate new position considering both height and spacing
          const newPositionIndex = Math.round(
            finalY / (currentItemHeight + itemSpacing)
          );

          const clampedNewPosition = Math.max(
            0,
            Math.min(totalItems - 1, newPositionIndex)
          );

          translateY.value = withSpring(
            clampedNewPosition * (currentItemHeight + itemSpacing),
            SPRING_CONFIG
          );

          if (clampedNewPosition !== index) {
            runOnJS(onDragEnd)(habit.id, clampedNewPosition);
          }
        },
      })
    : undefined; // No gesture handler if not draggable

  const itemView = (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: theme.background.paper },
        !isDraggable && styles.nonDraggableContainer,
      ]}
    >
      {/* Only show checkbox if NOT in the habits screen (where isDraggable is true) */}
      {!isDraggable && date && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, { borderColor: habit.color }]}>
            {isCompleted ? (
              <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
            ) : (
              <Circle size={16} color={habit.color} style={styles.circleIcon} />
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {habit.name}
        </Text>

        {habit.description ? (
          <Text style={[styles.description, { color: theme.text.secondary }]}>
            {habit.description}
          </Text>
        ) : null}

        <View style={styles.statsContainer}>
          {streak > 0 && (
            <Text style={[styles.streakText, { color: COLORS.primary.main }]}>
              {streak} day{streak !== 1 ? 's' : ''} streak 🔥
            </Text>
          )}

          {goalReached && (
            <Text style={[styles.streakText, { color: COLORS.success.main }]}>
              Goal reached! {goalExceeded ? '🏆' : '✨'}
            </Text>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(habitId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit2 size={18} color={theme.text.secondary} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(habitId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color={COLORS.error.main} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );

  // Conditionally wrap itemView with PanGestureHandler
  if (isDraggable && gestureHandler) {
    return (
      <>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          {itemView}
        </PanGestureHandler>
        {showConfetti && (
          <View style={styles.fullScreenConfetti}>
            <ConfettiCannon
              count={200}
              origin={{ x: screenWidth / 2, y: screenHeight }}
              autoStart={true}
              fadeOut={true}
              colors={[
                COLORS.primary.main,
                COLORS.success.main,
                '#FFD700',
                '#FF69B4',
                '#00CED1',
              ]}
              explosionSpeed={350}
              fallSpeed={3000}
            />
          </View>
        )}
      </>
    );
  }

  // If not draggable, return itemView directly
  return (
    <>
      {itemView}
      {showConfetti && (
        <View style={styles.fullScreenConfetti}>
          <ConfettiCannon
            count={200}
            origin={{ x: screenWidth / 2, y: screenHeight }}
            autoStart={true}
            fadeOut={true}
            colors={[
              COLORS.primary.main,
              COLORS.success.main,
              '#FFD700',
              '#FF69B4',
              '#00CED1',
            ]}
            explosionSpeed={350}
            fallSpeed={3000}
          />
        </View>
      )}
    </>
  );
};

// Memoize the component
const MemoizedHabitItem = memo(HabitItemInner, (prevProps, nextProps) => {
  // Custom comparison function.
  // Only re-render if essential props that affect rendering change.
  if (prevProps.habitId !== nextProps.habitId) return false;
  if (prevProps.date !== nextProps.date) return false;

  // A more robust check for habit changes would be to pass the habit object itself
  // and compare its relevant properties, or a specific 'version' prop if available.
  // For now, we assume that if habit data relevant to HabitItem changes,
  // the parent component will pass a new `habitId` or other distinguishing prop.

  // We also need to consider if `isCompleted` (derived from context) should be a prop
  // for more precise memoization. If `isCompleted` changes but other props don't,
  // this memoization might prevent a necessary re-render.
  // A common pattern is to pass such derived state as props.
  // For this iteration, we'll keep it simple.

  if (prevProps.showActions !== nextProps.showActions) return false;
  if (prevProps.isDraggable !== nextProps.isDraggable) return false;
  if (prevProps.initialY !== nextProps.initialY) return false;
  if (prevProps.index !== nextProps.index) return false;
  if (prevProps.itemHeight !== nextProps.itemHeight) return false;
  if (prevProps.itemSpacing !== nextProps.itemSpacing) return false;
  if (prevProps.totalItems !== nextProps.totalItems) return false;

  // Compare habit object properties if it were passed as a prop
  // if (JSON.stringify(prevProps.habit) !== JSON.stringify(nextProps.habit)) return false;

  return true; // Prevent re-render if all compared props are equal
});

// Export the memoized component as HabitItem
export { MemoizedHabitItem as HabitItem };

const styles = StyleSheet.create({
  statsContainer: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  container: {
    // This style is applied to the Animated.View
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    // marginBottom: 8, // Removed: Spacing is now handled by the parent list's initialY calculation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // marginBottom will be handled by the list for draggable items
    // For non-draggable, we might want a margin if it's in a simple list
  },
  nonDraggableContainer: {
    position: 'relative', // Ensure it's not absolutely positioned
    marginBottom: 8, // Add margin back for non-draggable items if they are in a list
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkIcon: {
    backgroundColor: COLORS.success.main,
    borderRadius: 10,
    padding: 2,
  },
  circleIcon: {
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  // streakContainer style removed as it's replaced by statsContainer
  streakText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fullScreenConfetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 9999,
  },
});
