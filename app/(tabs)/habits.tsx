import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Calendar, ClipboardList } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/colors';
import { useAppTheme } from '../../context/ThemeContext';
import { Habit, useHabits } from '../../context/HabitContext';
import { HabitItem } from '../../components/HabitItem';
import { HabitForm } from '../../components/HabitForm';
import { EmptyState } from '../../components/EmptyState';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
};

const ITEM_HEIGHT = 80;
const ITEM_SPACING = 8;

export default function HabitsScreen() {
  const { habits, deleteHabit, reorderHabits } = useHabits();
  const { currentTheme: theme, effectiveTheme } = useAppTheme();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined
  );

  // Sort habits based on position
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => a.position - b.position);
  }, [habits]);

  // State to hold the target Y positions (numbers, not SharedValues)
  const [positions, setPositions] = useState<number[]>([]);
  // Track both the index of the dragged item and its current Y position
  const draggingIndex = useSharedValue(-1);
  const draggingCurrentY = useSharedValue(0);

  // Effect to initialize/update target Y positions when habits change
  useEffect(() => {
    setPositions(
      sortedHabits.map((_, index) => index * (ITEM_HEIGHT + ITEM_SPACING))
    );
  }, [sortedHabits]); // Re-run if habits array changes (order or length)

  // The Y position of items being dragged (this can remain a shared value for now)
  // const draggingY = useSharedValue(-1); // This was correct

  // useEffect for resetting positions after drag might need to be removed or rethought
  // as pos.value won't exist. For now, let's comment it out to avoid immediate errors.
  // useEffect(() => {
  //   positions.forEach((pos, index) => { // pos is now a number
  //     // Check if the position needs resetting (e.g., after drag end)
  //     // This might need refinement based on drag logic, but ensures initial correct values
  //     // if (pos !== index * 80 && draggingY.value === -1) { // Condition would change
  //     //   // Cannot assign to pos.value as pos is a number
  //     // }
  //   });
  // }, [sortedHabits, positions, draggingY.value]);

  const handleEditHabit = useCallback(
    (habitId: string) => {
      const habitToEdit = habits.find((h) => h.id === habitId);
      if (habitToEdit) {
        setEditingHabit(habitToEdit);
        setShowAddHabit(true);
      }
    },
    [habits]
  );

  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      const habitToDelete = habits.find((h) => h.id === habitId);
      if (!habitToDelete) return;
      Alert.alert(
        'Delete Habit',
        `Are you sure you want to delete "${habitToDelete.name}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteHabit(habitId),
          },
        ]
      );
    },
    [habits, deleteHabit]
  );

  const handleCloseForm = useCallback(() => {
    setShowAddHabit(false);
    setEditingHabit(undefined);
  }, []);

  const handleDragEnd = useCallback(
    (habitId: string, newPosition: number) => {
      // Find the current indices
      const currentIndex = sortedHabits.findIndex((h) => h.id === habitId);

      // Create a new sorted array
      const newOrder = [...sortedHabits];

      // Move the item
      const [removed] = newOrder.splice(currentIndex, 1);
      newOrder.splice(newPosition, 0, removed);

      // Update the reorder with new IDs
      reorderHabits(newOrder.map((h) => h.id));
    },
    [sortedHabits, reorderHabits]
  );

  const renderHabitItem = ({ item, index }: { item: Habit; index: number }) => {
    // positions[index] now holds the target Y value (a number)
    const initialY = positions[index] ?? index * (ITEM_HEIGHT + ITEM_SPACING);

    return (
      // The PanGestureHandler and Animated.View for drag container are removed from here.
      // HabitItem will now manage its own animation and gesture handling.
      <HabitItem
        key={item.id} // Ensure key is on the outermost component if mapping
        habitId={item.id}
        isDraggable={true} // Enable dragging for this screen
        showActions
        onEdit={handleEditHabit} // Pass the memoized callback directly
        onDelete={handleDeleteHabit} // Pass the memoized callback directly
        initialY={initialY}
        index={index}
        draggingIndex={draggingIndex} // Pass the dragging index
        draggingCurrentY={draggingCurrentY} // Pass the current Y position
        onDragEnd={handleDragEnd} // Pass the callback for reordering
        totalItems={sortedHabits.length}
        itemHeight={ITEM_HEIGHT} // Use the constant
        itemSpacing={ITEM_SPACING} // Pass the spacing constant
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.default }]}
      edges={['right', 'left']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Manage Habits
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: COLORS.primary.main }]}
          onPress={() => setShowAddHabit(true)}
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showAddHabit ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: theme.text.primary }}>Loading form...</Text>
        </View>
      ) : sortedHabits.length > 0 ? (
        <View style={styles.listContainer}>
          <Text style={[styles.instruction, { color: theme.text.secondary }]}>
            Drag and drop to reorder your habits
          </Text>
          {/* The container View for items needs to have a defined height
              to allow absolute positioning of HabitItems to work correctly.
              Each HabitItem is 80px high.
          */}
          <View
            style={[
              styles.flatListContainer,
              { height: sortedHabits.length * (ITEM_HEIGHT + ITEM_SPACING) },
            ]}
          >
            {sortedHabits.map(
              (habit, index) => renderHabitItem({ item: habit, index }) // key is now on HabitItem itself
            )}
          </View>
        </View>
      ) : (
        <EmptyState
          title="No habits created"
          message="Create habits to track and build your daily routine."
          buttonText="Create New Habit"
          onButtonPress={() => setShowAddHabit(true)}
          icon={<ClipboardList size={48} color={COLORS.primary.main} />}
        />
      )}

      <Modal
        visible={showAddHabit}
        animationType="fade"
        transparent={true} // Changed back to true
        onRequestClose={handleCloseForm}
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
          <HabitForm initialData={editingHabit} onClose={handleCloseForm} />
        </View>
      </Modal>
    </SafeAreaView>
  );
} // Ensure this closing brace is correct

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  flatListContainer: {
    flex: 1,
    // height: '100%', // Height will be dynamic based on content
  },
  // habitItemContainer style is no longer needed here as it's managed by HabitItem
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor will be set dynamically in the component
  },
});
